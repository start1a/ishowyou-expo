import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { auth, database } from '@src/config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoomService } from '@src/api/services/roomService';
import { registerForPushNotificationsAsync } from '@src/utils/pushNotifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isFirstLaunch: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AsyncStorage 키 상수
const STORAGE_KEYS = {
  USER_TOKEN: '@auth_user_token',
  IS_FIRST_LAUNCH: '@app_first_launch',
  LAST_LOGIN_TIME: '@auth_last_login',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // 세션 저장 (로컬 + Firebase)
  const saveUserSession = async (user: User) => {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_TIME, new Date().toISOString());

      // Firebase Realtime Database에 유저 프로필 저장/업데이트
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        // 기존 유저: 로그인 시간 및 푸시 토큰 업데이트
        const updates: any = {
          displayName: user.displayName || '익명',
          photoURL: user.photoURL || null,
          lastLoginAt: serverTimestamp(),
        };

        // 푸시 토큰 발급 및 저장
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          updates.pushToken = pushToken;
        }

        await update(userRef, updates);
      } else {
        // 신규 유저: 전체 프로필 생성
        const pushToken = await registerForPushNotificationsAsync();
        await set(userRef, {
          userId: user.uid,
          displayName: user.displayName || '익명',
          email: user.email || '',
          photoURL: user.photoURL || null,
          pushToken: pushToken || null,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('세션 저장 오류:', error);
    }
  };

  // 세션 불러오기
  const loadUserSession = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const isFirst = await AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_LAUNCH);

      if (isFirst === null) {
        await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LAUNCH, 'false');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }

      if (userData) {
        const parsedUser = JSON.parse(userData);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('세션 불러오기 오류:', error);
      return null;
    }
  };

  // 세션 삭제
  const clearUserSession = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_TIME);
    } catch (error) {
      console.error('세션 삭제 오류:', error);
    }
  };

  // Auth 초기화 및 세션 복원
  useEffect(() => {
    let mounted = true;
    let timeoutId: any;
    let authInitialized = false;

    const configureGoogleSignIn = async () => {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    };

    const initAuth = async () => {
      try {
        await configureGoogleSignIn();

        // 저장된 세션 확인
        const savedSession = await loadUserSession();

        // 저장된 세션이 있다면 먼저 복원 시도
        if (savedSession) {
          try {
            console.log('⏳ 저장된 세션으로 자동 복원 시도...');
            const googleUser = await GoogleSignin.signInSilently();

            const googleUserAny = googleUser as any;
            const idToken = googleUserAny?.data?.idToken || googleUserAny?.idToken;

            if (idToken) {
              console.log('🔄 Google 자동 로그인 성공, Firebase 연동...');
              const credential = GoogleAuthProvider.credential(idToken);
              await signInWithCredential(auth, credential);
              // 이 시점에서 onAuthStateChanged가 트리거되어 상태를 업데이트할 것임
            }
          } catch (restoreError) {
            console.log('자동 복원 실패 (만료됨 또는 취소됨):', restoreError);
            // 복원 실패 시 세션 삭제
            await clearUserSession();
          }
        }

        // Firebase Auth 상태 리스너 등록
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;

          console.log('Firebase Auth 상태 변경:', firebaseUser?.email || 'null');

          if (firebaseUser) {
            // 로그인 상태
            await saveUserSession(firebaseUser);
            setUser(firebaseUser);
          } else {
            // 로그아웃 상태
            // 이미 위에서 복원을 시도했으므로, 여기서 다시 복원하지 않음
            setUser(null);
          }

          setLoading(false);
          authInitialized = true;
          if (timeoutId) clearTimeout(timeoutId);
        });

        // 타임아웃 예외 처리 (네트워크 지연 등)
        timeoutId = setTimeout(() => {
          if (!authInitialized && mounted) {
            console.log('Auth 초기화 타임아웃 - 강제 로딩 해제');
            setLoading(false);
          }
        }, 7000);

        return unsubscribe;
      } catch (error) {
        console.error('Auth 초기화 오류:', error);
        if (mounted) setLoading(false);
        return () => { };
      }
    };

    const cleanup = initAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    try {
      // Play Services 확인
      await GoogleSignin.hasPlayServices();

      // Google 로그인 시도
      const userInfo = await GoogleSignin.signIn();

      // ID Token 확인
      if (userInfo.data?.idToken) {
        const { idToken } = userInfo.data;

        // Firebase Auth에 Google 토큰으로 로그인
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        throw new Error('ID Token을 받지 못했습니다');
      }
    } catch (error: any) {
      console.error('Google 로그인 에러:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('  - 사용자가 로그인을 취소했습니다');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('  - 로그인이 이미 진행 중입니다');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('  - Play Services를 사용할 수 없습니다');
      } else {
        console.log('  - 기타 에러:', error.code);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Google Sign-In에서도 로그아웃
      await GoogleSignin.signOut();

      // Firebase 로그아웃
      await signOut(auth);

      // 로컬 세션 삭제
      await clearUserSession();

    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || !auth.currentUser) {
      throw new Error('로그인이 필요합니다');
    }

    setLoading(true);
    try {
      // 1. 소유한 방 확인
      const roomsResult = await RoomService.getRooms();
      if (roomsResult.success && roomsResult.data) {
        const ownedRooms = roomsResult.data.filter(room => room.ownerId === user.uid);
        if (ownedRooms.length > 0) {
          throw new Error('OWNED_ROOMS_EXIST');
        }
      }

      // 2. Google Sign-In 로그아웃
      await GoogleSignin.signOut();

      // 3. Firebase Auth 계정 삭제
      await deleteUser(auth.currentUser);

      // 4. 로컬 세션 삭제
      await clearUserSession();

    } catch (error) {
      console.error('계정 삭제 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    googleLogin,
    logout,
    deleteAccount,
    isFirstLaunch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
