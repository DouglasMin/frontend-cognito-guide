import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterFormData } from '../../types/auth';
import { handleAuthError } from '../../hooks/useAuth';
import { calculateSecretHash } from '../../utils/secretHash';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

/**
 * 회원가입 컴포넌트
 * AWS Cognito 사용자 풀에 신규 사용자를 등록하는 기능 제공
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 입력 폼 값 변경 처리
   * 사용자 입력 데이터를 상태에 저장
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 회원가입 양식 제출 처리
   * AWS Cognito signUp API를 사용하여 사용자 등록 수행
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 비밀번호 일치 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 비밀번호 복잡성 검사 (최소 8자, 대소문자, 숫자, 특수문자 포함)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
      setLoading(false);
      return;
    }

    try {
      console.log('회원가입 시도 중...');
      
      // 환경 변수에서 Cognito 설정 가져오기
      const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
      
      if (!clientId) {
        throw new Error('Cognito 클라이언트 ID가 설정되지 않았습니다.');
      }
      
      // SECRET_HASH 계산
      const secretHash = calculateSecretHash(formData.email, clientId, clientSecret);
      
      // 디버깅 정보 출력
      console.log('회원가입 요청 정보 (디버깅):', {
        region,
        clientIdLength: clientId.length,
        email: formData.email,
        secretHashLength: secretHash.length,
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID
      });
      
      // 이메일 주소에 타임스탬프 추가하여 중복 방지 (테스트용)
      const timestamp = new Date().getTime();
      const uniqueEmail = formData.email.replace('@', `+${timestamp}@`);
      
      console.log('고유 이메일 생성:', {
        originalEmail: formData.email,
        uniqueEmail: uniqueEmail
      });
      
      // AWS SDK 클라이언트 생성
      const client = new CognitoIdentityProviderClient({ region });
      
      // 회원가입 명령 생성
      const signUpCommand = new SignUpCommand({
        ClientId: clientId,
        Username: uniqueEmail,
        Password: formData.password,
        SecretHash: secretHash,
        UserAttributes: [
          {
            Name: 'email',
            Value: uniqueEmail
          },
          {
            Name: 'given_name',
            Value: formData.name
          }
        ]
      });
      
      // 회원가입 요청 전송
      const result = await client.send(signUpCommand);
      
      console.log('회원가입 결과:', result);
      
      // 이메일 인증 페이지로 이동 (사용자 이메일 전달)
      navigate('/verify-email', { state: { email: uniqueEmail } });
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      setError(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
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
          <small className="form-hint">
            비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </form>
      <div className="auth-footer">
        <p>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 