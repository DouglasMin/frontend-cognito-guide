import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 보호된 라우트 속성 인터페이스
 * children: 인증된 사용자에게만 표시할 자식 컴포넌트
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 보호된 라우트 컴포넌트
 * 로그인한 사용자만 접근할 수 있는 페이지를 보호하는 컴포넌트
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    /**
     * 사용자 인증 상태 확인 함수
     * 로컬 스토리지에 저장된 토큰으로 인증 상태 확인
     */
    const checkAuth = async () => {
      try {
        console.log('인증 상태 확인 중...');
        // localStorage에서 토큰을 확인하는 방식으로 인증 상태 확인
        const accessToken = localStorage.getItem('accessToken');
        const idToken = localStorage.getItem('idToken');
        
        if (accessToken || idToken) {
          console.log('토큰 확인됨, 인증됨');
          setIsAuthenticated(true);
        } else {
          console.log('토큰 없음, 인증 안됨');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로딩 중인 경우 로딩 표시
  if (isLoading) {
    return <div className="loading">인증 상태 확인 중...</div>;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    console.log('인증되지 않음, 로그인 페이지로 리다이렉트');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 보호된 컴포넌트 렌더링
  console.log('인증됨, 보호된 라우트 렌더링');
  return <>{children}</>;
};

export default ProtectedRoute; 