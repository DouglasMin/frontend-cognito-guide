import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';

interface UserInfo {
  email?: string;
  given_name?: string;
  sub?: string; // Cognito의 사용자 UUID
  email_verified?: string; // Cognito는 문자열로 반환
  username?: string;
  [key: string]: any; // 기타 속성들
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 사용자 정보 로드
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // 현재 사용자 확인
      const currentUser = await getCurrentUser();
      
      // 사용자 속성 가져오기
      const attributes = await fetchUserAttributes();
      
      setUserInfo({
        ...attributes,
        username: currentUser.username
      });
    } catch (error: any) {
      console.error('사용자 정보 로드 오류:', error);
      setError('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      // 인증 오류 시 로그인 페이지로 리다이렉트
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('로그아웃 오류:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>대시보드</h1>
      {error && <div className="error-message">{error}</div>}
      
      {userInfo && (
        <div className="user-info-card">
          <h2>사용자 정보</h2>
          <div className="user-info-item">
            <strong>이름:</strong> {userInfo.given_name || '설정되지 않음'}
          </div>
          <div className="user-info-item">
            <strong>이메일:</strong> {userInfo.email || '설정되지 않음'}
            {userInfo.email_verified === 'true' && <span className="verified-badge">✓ 인증됨</span>}
          </div>
          <div className="user-info-item">
            <strong>사용자 ID:</strong> {userInfo.sub || '알 수 없음'}
          </div>
        </div>
      )}
      
      <button onClick={handleLogout} className="logout-button">
        로그아웃
      </button>
    </div>
  );
};

export default Dashboard; 