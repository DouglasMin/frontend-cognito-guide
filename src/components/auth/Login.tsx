import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LoginFormData } from '../../types/auth';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash } from '../../utils/secretHash';

/**
 * 로그인 컴포넌트
 * AWS Cognito를 사용한 사용자 인증 처리
 * AWS SDK를 직접 사용하여 로그인 요청 처리
 */
const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;

      if (!clientId) {
        throw new Error('Cognito Client ID가 설정되지 않았습니다.');
      }

      // SECRET_HASH 계산
      const secretHash = calculateSecretHash(data.email, clientId, clientSecret);

      const client = new CognitoIdentityProviderClient({ region });

      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: data.email,
          PASSWORD: data.password,
          SECRET_HASH: secretHash
        }
      });

      const response = await client.send(command);
      console.log('로그인 성공:', response);

      if (response.AuthenticationResult) {
        handleAuthenticationSuccess(response.AuthenticationResult, data.email);
      } else {
        throw new Error('인증 결과가 없습니다.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      alert(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = () => {
    try {
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const domainPrefix = import.meta.env.VITE_COGNITO_DOMAIN_PREFIX;
      const redirectUri = window.location.origin + '/oauth-callback';
      
      if (!domainPrefix) {
        throw new Error('Cognito 도메인 설정이 없습니다.');
      }
      
      // 상태 값 생성 (CSRF 방지)
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem('oauth_state', state);
      
      // Cognito Hosted UI 로그인 URL 구성
      const authorizationEndpoint = `https://${domainPrefix}.auth.${region}.amazoncognito.com/oauth2/authorize`;
      const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        identity_provider: 'Google',
        scope: 'email openid profile',
        state: state
      });
      
      console.log('구글 로그인 리디렉션:', `${authorizationEndpoint}?${queryParams.toString()}`);
      
      // Cognito Hosted UI로 리디렉션
      window.location.href = `${authorizationEndpoint}?${queryParams.toString()}`;
    } catch (error: any) {
      console.error('구글 로그인 초기화 오류:', error);
      alert(error.message || '구글 로그인을 시작할 수 없습니다.');
    }
  };
  
  // 인증 결과 처리 함수
  const handleAuthenticationSuccess = (authResult: any, email: string) => {
    // 토큰 저장
    localStorage.setItem('accessToken', authResult.AccessToken || '');
    localStorage.setItem('idToken', authResult.IdToken || '');
    localStorage.setItem('refreshToken', authResult.RefreshToken || '');
    
    // 사용자 정보 저장
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', email.split('@')[0]); // 이메일에서 username 추출

    // JWT 디코딩하여 추가 정보 저장
    if (authResult.IdToken) {
      try {
        const payload = JSON.parse(atob(authResult.IdToken.split('.')[1]));
        if (payload.email) localStorage.setItem('userEmail', payload.email);
        if (payload['cognito:username']) localStorage.setItem('username', payload['cognito:username']);
        
        // 토큰 정보 콘솔에 출력
        console.log('ID 토큰 (권한 부여자 테스트에 이 값 사용):', authResult.IdToken);
        console.log('ID 토큰 페이로드:', payload);
      } catch (e) {
        console.error('JWT 디코딩 실패:', e);
      }
    }

    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: '이메일을 입력해주세요.' })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            {...register('password', { required: '비밀번호를 입력해주세요.' })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button type="submit">로그인</button>
      </form>

      <div className="social-login">
        <p>또는 다음 계정으로 로그인</p>
        <button 
          type="button" 
          className="google-login-button" 
          onClick={handleGoogleLogin}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google로 로그인
        </button>
      </div>

      <div className="login-links">
        <p>
          계정이 없으신가요? <a href="/register">회원가입</a>
        </p>
      </div>

      <style>
        {`
          .login-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          label {
            font-weight: bold;
          }

          input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          button {
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          button:hover {
            background-color: #0056b3;
          }
          
          .social-login {
            margin-top: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .social-login p {
            margin-bottom: 10px;
            color: #666;
          }
          
          .google-login-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            background-color: white;
            color: #757575;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            max-width: 240px;
            transition: background-color 0.3s;
          }
          
          .google-login-button:hover {
            background-color: #f8f8f8;
          }
          
          .google-login-button svg {
            margin-right: 10px;
          }

          .error {
            color: red;
            font-size: 0.8em;
          }
          
          .login-links {
            margin-top: 20px;
            text-align: center;
          }
          
          .login-links a {
            color: #007bff;
            text-decoration: none;
          }
          
          .login-links a:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default Login; 