import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { VerifyEmailFormData } from '../../types/auth';
import { handleAuthError } from '../../hooks/useAuth';
import { calculateSecretHash } from '../../utils/secretHash';
import { 
  CognitoIdentityProviderClient, 
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand 
} from '@aws-sdk/client-cognito-identity-provider';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  
  const [formData, setFormData] = useState<VerifyEmailFormData>({
    email: emailFromState,
    code: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      
      // SECRET_HASH 계산
      const secretHash = calculateSecretHash(formData.email, clientId, clientSecret);
      
      // AWS SDK 클라이언트 생성
      const client = new CognitoIdentityProviderClient({ region });
      
      // ConfirmSignUp 명령 생성
      const confirmSignUpCommand = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: formData.email,
        ConfirmationCode: formData.code,
        SecretHash: secretHash
      });
      
      // 이메일 인증 요청 전송
      await client.send(confirmSignUpCommand);
      
      console.log('이메일 인증 성공');
      setSuccessMessage('이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('이메일 인증 오류:', error);
      setError(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError('이메일 주소를 입력해주세요.');
      return;
    }
    
    setResending(true);
    setError(null);

    try {
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      
      // SECRET_HASH 계산
      const secretHash = calculateSecretHash(formData.email, clientId, clientSecret);
      
      // AWS SDK 클라이언트 생성
      const client = new CognitoIdentityProviderClient({ region });
      
      // ResendConfirmationCode 명령 생성
      const resendCodeCommand = new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: formData.email,
        SecretHash: secretHash
      });
      
      // 인증 코드 재전송 요청
      await client.send(resendCodeCommand);
      
      console.log('인증 코드 재전송 성공');
      setSuccessMessage('인증 코드가 이메일로 재전송되었습니다.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('인증 코드 재전송 오류:', error);
      setError(handleAuthError(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>이메일 인증</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
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
            disabled={!!emailFromState}
          />
        </div>
        <div className="form-group">
          <label htmlFor="code">인증 코드</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '인증 중...' : '인증 확인'}
        </button>
      </form>
      <button 
        className="resend-button" 
        onClick={handleResendCode} 
        disabled={resending}
      >
        {resending ? '재전송 중...' : '인증 코드 재전송'}
      </button>
      <div className="auth-footer">
        <p>
          <Link to="/login">로그인 페이지로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail; 