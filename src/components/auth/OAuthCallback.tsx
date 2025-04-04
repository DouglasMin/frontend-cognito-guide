import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * OAuth 콜백 처리 컴포넌트
 * 구글 로그인 후 리디렉션되는 페이지
 * URL에서 인증 코드를 추출하고 토큰으로 교환
 */
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 인증 코드 및 상태 추출
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = localStorage.getItem('oauth_state');
    
    const processAuth = async () => {
      try {
        // 상태 검증 (CSRF 방지)
        if (!state || state !== savedState) {
          throw new Error('상태 값이 일치하지 않습니다. 보안 문제가 발생했을 수 있습니다.');
        }
        
        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }
        
        console.log('인증 코드 수신:', code);
        
        // 클라이언트 정보 가져오기
        const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
        const domainPrefix = import.meta.env.VITE_COGNITO_DOMAIN_PREFIX;
        const redirectUri = window.location.origin + '/oauth-callback';
        
        if (!clientId || !domainPrefix) {
          throw new Error('Cognito 설정이 누락되었습니다.');
        }
        
        // 토큰 엔드포인트 URL
        const tokenEndpoint = `https://${domainPrefix}.auth.${region}.amazoncognito.com/oauth2/token`;
        
        // 토큰 교환 요청 준비
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code: code,
          redirect_uri: redirectUri
        });
        
        // 클라이언트 시크릿이 있는 경우 Authorization 헤더 추가
        const headers: HeadersInit = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        if (clientSecret) {
          const credentials = btoa(`${clientId}:${clientSecret}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        
        // 토큰 교환 요청 보내기
        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: headers,
          body: body.toString()
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`토큰 교환 실패: ${response.status} ${errorData}`);
        }
        
        // 토큰 결과 파싱
        const tokenData = await response.json();
        console.log('토큰 응답:', {
          hasAccessToken: !!tokenData.access_token,
          hasIdToken: !!tokenData.id_token,
          hasRefreshToken: !!tokenData.refresh_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in
        });
        
        // 토큰 저장
        localStorage.setItem('accessToken', tokenData.access_token || '');
        localStorage.setItem('idToken', tokenData.id_token || '');
        localStorage.setItem('refreshToken', tokenData.refresh_token || '');
        
        // ID 토큰에서 사용자 정보 추출
        if (tokenData.id_token) {
          try {
            const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
            
            localStorage.setItem('userEmail', payload.email || '');
            localStorage.setItem('username', (payload.email || '').split('@')[0]);
            
            if (payload['cognito:username']) {
              localStorage.setItem('username', payload['cognito:username']);
            }
            
            console.log('사용자 정보:', {
              email: payload.email,
              name: payload.name,
              picture: payload.picture
            });
          } catch (e) {
            console.error('JWT 디코딩 실패:', e);
          }
        }
        
        // 정리 및 리디렉션
        localStorage.removeItem('oauth_state');
        setLoading(false);
        
        // 대시보드로 리디렉션
        navigate('/dashboard');
      } catch (error: any) {
        console.error('OAuth 콜백 처리 오류:', error);
        setError(error.message || '인증 처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    processAuth();
  }, [location, navigate]);
  
  if (loading) {
    return (
      <div className="oauth-callback-container">
        <div className="loading-spinner"></div>
        <p>인증 처리 중...</p>
        
        <style>{`
          .oauth-callback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            font-family: Arial, sans-serif;
          }
          
          .loading-spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #007bff;
            width: 40px;
            height: 40px;
            margin-bottom: 20px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="oauth-callback-container error">
        <h2>인증 오류</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>로그인으로 돌아가기</button>
        
        <style>{`
          .oauth-callback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            font-family: Arial, sans-serif;
            padding: 0 20px;
          }
          
          .error h2 {
            color: #dc3545;
          }
          
          button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          
          button:hover {
            background-color: #0056b3;
          }
        `}</style>
      </div>
    );
  }
  
  return null; // 로딩 중이 아니고 오류가 없으면 대시보드로 리디렉션됨
};

export default OAuthCallback; 