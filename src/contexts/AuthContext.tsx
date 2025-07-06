import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext 초기화 중...');
    console.log('Auth 인스턴스:', auth);
    
    // Google Sign-In 설정
    const configureGoogleSignIn = async () => {
      try {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        if (webClientId) {
          GoogleSignin.configure({
            webClientId: webClientId,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
          });
          console.log('Google Sign-In 설정 완료');
        }
      } catch (error) {
        console.error('Google Sign-In 설정 오류:', error);
      }
    };

    configureGoogleSignIn();
    
    // Auth 초기화 지연 및 에러 처리
    const initAuth = async () => {
      try {
        // Firebase Auth 연결 테스트
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth 상태 변경:', user);
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth 초기화 오류:', error);
        // 에러 시 수동으로 loading 해제
        setLoading(false);
        return () => {};
      }
    };

    const cleanup = initAuth();
    return () => {
      cleanup.then(unsubscribe => unsubscribe()).catch(console.error);
    };
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    try {
      console.log('Google 로그인 시도 중...');
      
      // Google Sign-In 가능 여부 확인
      await GoogleSignin.hasPlayServices();
      
      // Google 로그인 시도
      const userInfo = await GoogleSignin.signIn();
      console.log('Google 로그인 성공:', userInfo);
      
      // ID Token 확인
      if (userInfo.data?.idToken) {
        const { idToken } = userInfo.data;
        console.log('ID Token 받음:', idToken ? '✓' : '✗');
        
        // Firebase Auth에 Google 토큰으로 로그인
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        
        console.log('Firebase Google 로그인 성공:', userCredential.user);
      } else {
        throw new Error('ID Token을 받지 못했습니다');
      }
    } catch (error: any) {
      console.error('Google 로그인 에러:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('사용자가 로그인을 취소했습니다');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('로그인이 이미 진행 중입니다');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services를 사용할 수 없습니다');
      } else {
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Firebase 로그아웃
      await signOut(auth);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
