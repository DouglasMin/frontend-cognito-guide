export interface User {
  username?: string;
  email?: string;
  given_name?: string;
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

/**
 * 로그인 폼 데이터 인터페이스
 * 사용자 로그인 시 필요한 입력 필드 정의
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * 회원가입 폼 데이터 인터페이스
 * 사용자 등록 시 필요한 입력 필드 정의
 */
export interface RegisterFormData {
  name: string;          // 사용자 이름 (given_name 속성으로 저장)
  email: string;         // 사용자 이메일 (username 및 email 속성으로 저장)
  password: string;      // 사용자 비밀번호
  confirmPassword: string; // 비밀번호 확인 (클라이언트만 사용, 서버로 전송 안 함)
}

/**
 * 인증 에러 타입 정의
 * AWS Cognito 인증 관련 에러 타입과 메시지
 */
export interface AuthError {
  name: string;      // 에러 이름 (예: NotAuthorizedException)
  code: string;      // 에러 코드 
  message: string;   // 에러 메시지
}

/**
 * 인증 상태 인터페이스
 * 현재 사용자의 인증 상태 관리에 사용
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

/**
 * 이메일 인증 폼 데이터 인터페이스
 */
export interface VerifyEmailFormData {
  code: string;      // 이메일로 전송된 인증 코드
}

/**
 * 사용자 속성 인터페이스
 * AWS Cognito에서 반환되는 사용자 속성 타입
 */
export interface UserAttribute {
  Name: string;     // 속성 이름 (예: 'email', 'given_name')
  Value: string;    // 속성 값
} 