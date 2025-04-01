/**
 * AWS Amplify 설정 파일
 * AWS Cognito 서비스 연결을 위한 초기화 설정
 */

import { Amplify } from 'aws-amplify';

// AWS CLI 프로필 설정 (smuwchat 프로필 사용)
// 이 부분은 AWS CLI 환경에서만 동작합니다.
// 로컬 개발 환경에서는 .aws/credentials 또는 .aws/config 파일에 smuwchat 프로필이 설정되어 있어야 합니다.
const awsExports = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      region: import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2',
      
      // 클라이언트 시크릿 설정
      // 주의: Amplify V6에서는 이 설정으로 시크릿을 추가하는 것 외에도
      // API 호출 시 직접 SECRET_HASH를 전달해야 합니다.
      clientSecret: import.meta.env.VITE_COGNITO_CLIENT_SECRET
    },
    credentialProvider: {
      // AWS CLI 프로필 smuwchat 사용 설정
      profileName: 'smuwchat'
    }
  }
};

try {
  Amplify.configure(awsExports);
  console.log('Amplify configured successfully with smuwchat profile');
} catch (error) {
  console.error('Error configuring Amplify:', error);
}

// 표준 설정(두 번째 설정은 중복될 수 있으므로 제거)
// 개발 환경에서 디버그 로그 활성화를 위한 설정
console.log('디버그 모드 활성화 - 개발 환경에서 상세 로그 확인 가능');

// 참고: Amplify V6에서는 Logger 대신 다른 방법을 사용하여 로깅 레벨을 설정해야 합니다.
// https://docs.amplify.aws/react/build-a-backend/auth/set-up-auth/ 문서 참조 