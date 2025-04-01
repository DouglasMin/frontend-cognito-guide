import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, fetchUserAttributes } from 'aws-amplify/auth';
import { LoginFormData } from '../../types/auth';
import { handleAuthError } from '../../hooks/useAuth';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash } from '../../utils/secretHash';

/**
 * 로그인 컴포넌트
 * AWS Cognito를 사용한 사용자 인증 처리
 * AWS SDK를 직접 사용하여 로그인 요청 처리
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 로그인 양식 제출 처리
   * AWS Cognito SDK를 사용하여 직접 인증 요청
   * USER_PASSWORD_AUTH 흐름을 사용하는 방식
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('시도 중: 로그인');
      
      // 환경 변수에서 Cognito 설정 가져오기
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      
      // SECRET_HASH 계산 - Cognito 클라이언트 시크릿이 있는 경우 필요
      const secretHash = calculateSecretHash(formData.email, clientId, clientSecret);
      
      // AWS SDK 클라이언트 생성 - 지정된 리전으로 Cognito 서비스 접근
      const client = new CognitoIdentityProviderClient({ region });
      
      // InitiateAuth 명령 생성 - 직접 사용자 암호 인증 방식 사용
      const initiateAuthCommand = new InitiateAuthCommand({
        ClientId: clientId, // Cognito 앱 클라이언트 ID
        AuthFlow: 'USER_PASSWORD_AUTH', // 인증 흐름 방식 (직접 암호 입력 방식)
        AuthParameters: {
          USERNAME: formData.email, // 사용자 이메일을 사용자명으로 사용
          PASSWORD: formData.password, // 사용자 비밀번호
          SECRET_HASH: secretHash // 클라이언트 시크릿이 있는 경우에 필요한 해시
        }
      });
      
      // 로그인 요청 전송 - AWS SDK 클라이언트로 인증 요청
      const response = await client.send(initiateAuthCommand);
      console.log('로그인 성공:', response);
      
      if (response.AuthenticationResult) {
        // 토큰을 로컬 스토리지에 저장 - 인증 상태 유지를 위함
        if (response.AuthenticationResult.IdToken) {
          localStorage.setItem('idToken', response.AuthenticationResult.IdToken);
          console.log('IdToken 저장됨');
        }
        if (response.AuthenticationResult.AccessToken) {
          localStorage.setItem('accessToken', response.AuthenticationResult.AccessToken);
          console.log('AccessToken 저장됨');
        }
        if (response.AuthenticationResult.RefreshToken) {
          localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken);
          console.log('RefreshToken 저장됨');
        }
        
        // 대시보드로 리다이렉트 - 로그인 성공 후 메인 화면으로 이동
        console.log('로그인 완료, 대시보드로 이동');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        // 비밀번호 변경 필요 - 초기 로그인시 Cognito가 요구하는 경우
        navigate('/reset-password', { state: { email: formData.email } });
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setError(handleAuthError(error));
      
      // 이메일 미인증 사용자인 경우 인증 페이지로 이동
      if (error.name === 'UserNotConfirmedException') {
        navigate('/verify-email', { state: { email: formData.email } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <div className="auth-footer">
        <p>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 