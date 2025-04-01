import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Home: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="home-container">
      <h1>Cognito 인증 테스트</h1>
      
      {isAuthenticated ? (
        <div className="authenticated-content">
          <h2>안녕하세요, {user?.givenName}님!</h2>
          <p>이메일: {user?.email}</p>
          <div className="button-group">
            <Link to="/dashboard" className="button">대시보드</Link>
            <button onClick={logout} className="button logout-button">로그아웃</button>
          </div>
        </div>
      ) : (
        <div className="unauthenticated-content">
          <p>AWS Cognito를 사용한 인증 시스템 테스트 애플리케이션입니다.</p>
          <p>시작하려면 로그인하거나 계정을 만드세요.</p>
          <div className="button-group">
            <Link to="/login" className="button">로그인</Link>
            <Link to="/register" className="button">회원가입</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 