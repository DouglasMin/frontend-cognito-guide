import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoIdentityProviderClient, GetUserCommand, GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    // 즉시 실행 함수로 변경 - 비동기 작업을 위한 패턴
    (async () => {
      try {
        await loadUserInfo();
      } catch (error) {
        console.error('대시보드 초기화 오류:', error);
      }
    })();
  }, []);

  /**
   * AWS Cognito를 사용하여 사용자 정보를 가져오는 함수
   * AccessToken을 사용하여 현재 인증된 사용자의 정보를 요청
   */
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      
      // 토큰 가져오기 - 로그인 시 저장된 AccessToken을 사용
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('인증 토큰이 없습니다.');
      }
      
      // 세션 확인
      console.log('세션 확인 중...');
      console.log('ACCESS TOKEN:', accessToken.substring(0, 20) + '...');
      
      // 클라이언트 생성 (사용할 때마다 새로 생성) - AWS SDK 클라이언트 초기화
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      const client = new CognitoIdentityProviderClient({ region });
      
      // 사용자 정보 요청 - GetUser API 호출을 통해 현재 세션의 사용자 정보 가져오기
      const getUserCommand = new GetUserCommand({
        AccessToken: accessToken
      });
      
      const response = await client.send(getUserCommand);
      console.log('사용자 정보 응답:', response);
      
      if (response && response.UserAttributes) {
        const userInfoData: UserInfo = { username: response.Username || '' };
        
        // UserAttributes 배열에서 속성 추출 - Cognito는 사용자 속성을 Name-Value 쌍 배열로 제공
        for (const attribute of response.UserAttributes) {
          if (attribute.Name && attribute.Value) {
            userInfoData[attribute.Name] = attribute.Value;
          }
        }
        
        setUserInfo(userInfoData);
        setError(null);
      } else {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('사용자 정보 로드 오류:', error);
      setError('사용자 정보를 불러올 수 없습니다. 로그인이 필요합니다.');
      
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      if (error.name === 'NotAuthorizedException' || 
          error.message.includes('토큰이 없습니다')) {
        // 토큰 삭제
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * AWS Cognito를 사용하여 사용자 로그아웃 처리
   * GlobalSignOut API를 호출하여 모든 기기에서 로그아웃 실행
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('인증 토큰이 없습니다.');
      }
      
      // 클라이언트 생성 - AWS SDK 클라이언트 초기화
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      const client = new CognitoIdentityProviderClient({ region });
      
      // 전역 로그아웃 요청 - 모든 디바이스에서 세션 종료
      const signOutCommand = new GlobalSignOutCommand({
        AccessToken: accessToken
      });
      
      await client.send(signOutCommand);
      console.log('로그아웃 성공');
      
      // 토큰 삭제 - 로컬 인증 상태 제거
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      navigate('/login');
    } catch (error: any) {
      console.error('로그아웃 오류:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
      
      // 토큰 삭제
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 오류가 발생해도 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>대시보드</h1>
        <button onClick={handleLogout} className="logout-button">로그아웃</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
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

        <div className="dashboard-widgets">
          <div className="widget">
            <h3>환영합니다!</h3>
            <p>성공적으로 AWS Cognito 인증을 구현했습니다.</p>
            <button onClick={loadUserInfo} className="refresh-button">
              사용자 정보 새로고침
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 