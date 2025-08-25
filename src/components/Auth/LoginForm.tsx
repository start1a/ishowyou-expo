import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@src/contexts/AuthContext';

export const LoginForm = () => {
  const { googleLogin, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-disabled':
            errorMessage = '계정이 비활성화되었습니다.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Google 로그인이 허용되지 않습니다.';
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-closed-by-user':
            errorMessage = '로그인이 취소되었습니다.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      Alert.alert('로그인 오류', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📺</Text>
          <Text style={styles.title}>IShowYou</Text>
          <Text style={styles.subtitle}>함께 보는 즐거움</Text>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.welcomeText}>환영합니다!</Text>
          <Text style={styles.descriptionText}>
            Google 계정으로 간편하게 로그인하세요
          </Text>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.disabledButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <>
                <Text style={styles.googleIcon}>🌐</Text>
                <Text style={styles.googleButtonText}>Google로 로그인</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 개인정보는 안전하게 보호됩니다
            </Text>
            <Text style={styles.infoText}>
              • Google 계정으로 빠른 로그인
            </Text>
            <Text style={styles.infoText}>
              • 언제든지 로그아웃 가능
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  loginSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
