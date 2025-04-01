import { useState, useEffect, useCallback } from 'react';
import { signInWithRedirect, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { AuthState, User } from '../types/auth';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

/**
 * AWS Cognito 인증 에러를 사용자 친화적인 메시지로 변환하는 함수
 * 다양한 인증 오류 유형을 처리하고 사용자가 이해하기 쉬운 메시지 반환
 * 
 * @param error - AWS Cognito에서 발생한 오류 객체
 * @returns 사용자에게 표시할 오류 메시지
 */
export const handleAuthError = (error: any): string => {
  const errorName = error.name || '';
  const errorMessage = error.message || '';
  
  console.error('인증 오류:', { name: errorName, message: errorMessage });

  // 사용자 인증 관련 오류
  if (errorName === 'NotAuthorizedException' || errorMessage.includes('Incorrect username or password')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  
  // 사용자 존재 여부 관련 오류
  if (errorName === 'UserNotFoundException') {
    return '등록되지 않은 사용자입니다.';
  }
  
  // 이메일 인증 관련 오류
  if (errorName === 'UserNotConfirmedException') {
    return '이메일 인증이 완료되지 않았습니다. 인증 코드를 확인해 주세요.';
  }
  
  // 이미 존재하는 사용자 오류
  if (errorName === 'UsernameExistsException') {
    return '이미 등록된 이메일 주소입니다.';
  }
  
  // 비밀번호 복잡성 요구사항 관련 오류
  if (errorName === 'InvalidPasswordException') {
    return '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
  }
  
  // 인증 코드 관련 오류
  if (errorName === 'CodeMismatchException') {
    return '잘못된 인증 코드입니다. 다시 확인해 주세요.';
  }
  
  if (errorName === 'ExpiredCodeException') {
    return '인증 코드가 만료되었습니다. 새로운 코드를 요청해 주세요.';
  }
  
  // 제한 초과 오류
  if (errorName === 'LimitExceededException') {
    return '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
  }
  
  // 네트워크 관련 오류
  if (errorName === 'NetworkError' || errorMessage.includes('network')) {
    return '네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.';
  }
  
  // 기타 오류
  return '인증 중 오류가 발생했습니다. 다시 시도해 주세요.';
};

/**
 * 인증 상태 관리 훅
 * AWS Cognito 인증 기능을 React 컴포넌트에서 쉽게 사용할 수 있도록 제공
 * 
 * @returns 인증 상태 및 인증 관련 함수들
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  /**
   * 현재 인증 상태 확인
   * AWS Cognito에서 현재 로그인한 사용자 정보를 가져옴
   */
  const checkAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const attributes = await fetchUserAttributes();
      
      const user: User = {
        email: attributes.email || '',
        given_name: attributes.given_name || '',
        sub: attributes.sub
      };
      
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.log('User not authenticated', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    }
  }, []);

  /**
   * 소셜 로그인 함수 
   * 현재는 리다이렉트 방식의 로그인만 지원
   */
  const login = useCallback(async () => {
    try {
      await signInWithRedirect();
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: handleAuthError(error),
        isLoading: false
      }));
    }
  }, []);

  /**
   * 로그아웃 함수
   * 현재 세션을 종료하고 인증 상태 초기화
   */
  const logout = useCallback(async () => {
    try {
      await signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: handleAuthError(error)
      }));
    }
  }, []);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAuth; 