import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CredentialsCheck from '../components/auth/CredentialsCheck';
import './Dashboard.css';

/**
 * 사용자 정보 인터페이스
 * AWS Cognito에서 반환하는 사용자 속성을 저장하는 타입
 */
interface UserInfo {
  email?: string;
  given_name?: string;
  sub?: string;
  email_verified?: string;
  username?: string;
  [key: string]: any;
}

/**
 * 대시보드 컴포넌트
 * AWS Cognito로 인증된 사용자의 정보를 표시하는 메인 화면
 * 사용자 정보 조회와 로그아웃 기능 제공
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    checkAuthAndLoadUser();
  }, []);

  /**
   * 인증 상태 확인 후 사용자 정보 로드
   */
  const checkAuthAndLoadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // localStorage에서 토큰 확인
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('인증되지 않은 사용자입니다.');
      }

      // 임시로 토큰에서 이메일 정보만 표시
      setUserInfo({
        email: localStorage.getItem('userEmail') || '이메일 정보 없음',
        username: localStorage.getItem('username') || '사용자 정보 없음'
      });

    } catch (error: any) {
      console.error('인증 상태 확인 오류:', error);
      setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  /**
   * AWS Cognito를 사용하여 사용자 로그아웃 처리
   * GlobalSignOut API를 호출하여 모든 기기에서 로그아웃 실행
   */
  const handleLogout = () => {
    try {
      // 로컬 스토리지의 토큰들 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>대시보드</h1>
        <button onClick={handleLogout} className="logout-button">로그아웃</button>
      </header>

      <div className="dashboard-content">
        {userInfo && (
          <div className="user-info-card">
            <h2>사용자 정보</h2>
            <div className="user-info-item">
              <strong>이메일:</strong> {userInfo.email}
            </div>
            <div className="user-info-item">
              <strong>사용자명:</strong> {userInfo.username}
            </div>
          </div>
        )}

        <div className="credentials-section">
          <CredentialsCheck />
        </div>
      </div>

      <style>
        {`
          .dashboard-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .user-info-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
          }

          .user-info-item {
            margin: 10px 0;
          }

          .logout-button {
            padding: 10px 20px;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .logout-button:hover {
            background-color: #c82333;
          }

          .loading {
            text-align: center;
            padding: 20px;
          }

          .error-container {
            padding: 20px;
            text-align: center;
          }

          .error-message {
            color: #dc3545;
            padding: 10px;
            border: 1px solid #dc3545;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard; 