import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
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

  // 세션 저장
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

  useEffect(() => {
    let mounted = true;
    let authInitialized = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Google Sign-In 설정
    const configureGoogleSignIn = async () => {
      try {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        
        if (webClientId) {
          const config = {
            webClientId: webClientId,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
          };
          
          GoogleSignin.configure(config);
          
          // 설정 검증
          await GoogleSignin.hasPlayServices();
        } else {
          console.error('Google Web Client ID가 설정되지 않음');
        }
      } catch (error) {
        console.error('Google Sign-In 설정 오류:', error);
      }
    };

    // Auth 초기화 및 세션 복원
    const initAuth = async () => {
      try {
        await configureGoogleSignIn();
        
        // 저장된 세션 확인
        const savedSession = await loadUserSession();
        
        // Google Sign-In 사용자 상태 확인
        try {
          const googleUser = await GoogleSignin.getCurrentUser();
          
          // 다양한 구조 시도 (타입 캐스팅)
          const googleUserAny = googleUser as any;
          const idToken = googleUserAny?.data?.idToken || googleUserAny?.idToken;
          
          if (idToken) {
            const credential = GoogleAuthProvider.credential(idToken);
            try {
              await signInWithCredential(auth, credential);
            } catch (silentSignInError) {
              // 토큰 갱신 시도
              try {
                const refreshedUser = await GoogleSignin.signInSilently();
                
                const refreshedUserAny = refreshedUser as any;
                const newIdToken = refreshedUserAny?.data?.idToken || refreshedUserAny?.idToken;
                if (newIdToken) {
                  const newCredential = GoogleAuthProvider.credential(newIdToken);
                  await signInWithCredential(auth, newCredential);
                }
              } catch (refreshError) {
                console.log('토큰 갱신 실패:', refreshError);
              }
            }
          }
        } catch (googleError) {
          console.log('Google Sign-In 상태 확인 오류:', googleError);
        }
        
        // Firebase Auth 상태 리스너 등록 (즉시)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;
          
          console.log('Firebase Auth 상태 변경:', firebaseUser?.email || 'null');
          
          // 첫 번째 상태 변경 시 초기화 완료 표시
          if (!authInitialized) {
            authInitialized = true;
            console.log('Firebase Auth 초기화 완료');
            
            // 타임아웃 클리어
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
          
          if (firebaseUser) {
            // Firebase에서 로그인된 사용자가 있으면 세션 저장
            await saveUserSession(firebaseUser);
            setUser(firebaseUser);
            console.log('🔐 사용자 로그인 상태 설정:', firebaseUser.email);
          } else {
            // Firebase에서 로그아웃되었으면
            console.log('🔓 사용자 로그아웃 상태 설정');
            
            // 저장된 세션이 있다면 Google Sign-In으로 자동 복원 시도
            if (savedSession && !authInitialized) {
              console.log('⏳ 저장된 세션으로 자동 복원 시도...');
              try {
                // Google Sign-In으로 자동 로그인 시도
                const refreshedUser = await GoogleSignin.signInSilently();
                console.log('🔄 자동 로그인 성공:', refreshedUser);
                
                const refreshedUserAny = refreshedUser as any;
                const newIdToken = refreshedUserAny?.data?.idToken || refreshedUserAny?.idToken;
                if (newIdToken) {
                  const newCredential = GoogleAuthProvider.credential(newIdToken);
                  await signInWithCredential(auth, newCredential);
                  console.log('자동 세션 복원 성공');
                  return; // 성공하면 여기서 종료
                }
              } catch (autoLoginError) {
                console.log('자동 세션 복원 실패:', autoLoginError);
              }
            }
            
            // 로컬 세션 삭제
            await clearUserSession();
            setUser(null);
          }
          
          // 초기화가 완료된 후에만 로딩 상태 해제
          if (authInitialized) {
            setLoading(false);
          }
        });

        // 현재 사용자 상태 즉시 확인 (네이티브 환경에서 유용)
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('🔍 현재 Firebase 사용자 발견:', currentUser.email);
          if (mounted) {
            await saveUserSession(currentUser);
            setUser(currentUser);
            authInitialized = true;
            setLoading(false);
          }
        } else {
          console.log('🔍 현재 Firebase 사용자 없음');
        }

        // 네이티브 환경에서 Firebase Auth 초기화 타임아웃 설정 (7초)
        timeoutId = setTimeout(() => {
          if (!authInitialized && mounted) {
            console.log('Firebase Auth 초기화 타임아웃 - 강제 초기화');
            authInitialized = true;
            setLoading(false);
          }
        }, 7000);

        return unsubscribe;
      } catch (error) {
        console.error('Auth 초기화 오류:', error);
        if (mounted) {
          setLoading(false);
        }
        return () => {};
      }
    };

    const cleanup = initAuth();
    
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cleanup.then(unsubscribe => unsubscribe()).catch(console.error);
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

  const value = {
    user,
    loading,
    googleLogin,
    logout,
    isFirstLaunch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
