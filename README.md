# AWS Cognito 인증 구현 예제 프로젝트

이 프로젝트는 AWS SDK와 Amplify를 함께 사용하여 Cognito 인증을 구현하는 예제입니다.

## 환경 변수 설정

`.env` 파일에 다음 변수들을 설정하세요:

```bash
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_CLIENT_SECRET=your_client_secret  # 앱 클라이언트 시크릿 사용 시에만 필요
```

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

## AWS Cognito 설정

1. AWS Cognito 콘솔에서 앱 클라이언트 설정을 확인하세요:
   - "App integration" 탭 > 앱 클라이언트 선택
   - "Client secret" 섹션에서 시크릿 사용 여부 확인
   - 시크릿을 사용하는 경우 `.env`에 추가

2. 필수 사용자 속성:
   - email
   - given_name

## 기술 스택

- **프론트엔드**: React, TypeScript, Vite
- **인증 서비스**: AWS Cognito
- **API 통신**: 
  - AWS SDK for JavaScript v3 (@aws-sdk/client-cognito-identity-provider)
  - AWS Amplify Auth (@aws-amplify/auth)

## 주요 기능

- **회원가입**: `CognitoIdentityProviderClient`의 `SignUpCommand` 사용
- **이메일 인증**: `ConfirmSignUpCommand`, `ResendConfirmationCodeCommand` 사용
- **로그인**: `InitiateAuthCommand` 사용 (USER_PASSWORD_AUTH 플로우)
- **로그아웃**: `GlobalSignOutCommand` 사용
- **사용자 정보 조회**: `GetUserCommand` 사용

## 구현 특징

- Amplify Auth의 간편한 인증 API 활용
- AWS SDK를 통한 세밀한 인증 제어 가능
- SECRET_HASH 계산 로직 포함 (앱 클라이언트 시크릿 사용 시)

## 주의사항

1. **환경 변수**: `.env` 파일이 올바르게 설정되어 있는지 확인하세요.
2. **시크릿 사용**: 앱 클라이언트 시크릿 사용 시 모든 인증 요청에 SECRET_HASH를 포함해야 합니다.
3. **토큰 관리**: AccessToken, IdToken, RefreshToken을 안전하게 관리해야 합니다.

## 중요한 파일 및 디렉토리 구조

프로젝트를 이해하기 위해 살펴봐야 할 주요 파일들:

```
src/
├── config/
│   └── amplify.ts               # AWS Amplify 초기화 및 설정
├── components/
│   └── auth/
│       ├── Login.tsx            # 로그인 컴포넌트
│       ├── Register.tsx         # 회원가입 컴포넌트
│       ├── VerifyEmail.tsx      # 이메일 인증 컴포넌트
│       └── ProtectedRoute.tsx   # 인증된 사용자만 접근 가능한 라우트 컴포넌트
├── hooks/
│   └── useAuth.ts               # 인증 상태 관리 훅
├── pages/
│   ├── Home.tsx                 # 홈 페이지
│   └── Dashboard.tsx            # 사용자 대시보드 페이지
├── types/
│   └── auth.ts                  # 인증 관련 타입 정의
└── utils/
    └── secretHash.ts            # SECRET_HASH 계산 유틸리티 (앱 클라이언트 시크릿 사용 시)
```

## 개발자를 위한 주요 파일 설명

### 1. 초기 설정 (config/amplify.ts)
Amplify 라이브러리를 초기화하고 AWS Cognito 연결을 설정합니다. 이 파일에서 환경 변수를 사용하여 Cognito 사용자 풀 정보를 구성합니다.

### 2. 인증 컴포넌트

- **Register.tsx**: 회원가입 양식과 Cognito 사용자 등록 로직
- **VerifyEmail.tsx**: 이메일 인증 코드 입력 및 검증 로직
- **Login.tsx**: 로그인 양식과 인증 처리 로직
- **ProtectedRoute.tsx**: 인증된 사용자만 접근 가능하도록 라우트 보호

### 3. 인증 상태 관리 (hooks/useAuth.ts)
React 훅을 사용하여 인증 상태를 관리하고, 로그인/로그아웃 함수를 제공합니다. 이 파일에서 `handleAuthError` 함수는 AWS Cognito의 다양한 오류를 사용자 친화적인 메시지로 변환합니다.

### 4. 타입 정의 (types/auth.ts)
TypeScript 타입 정의를 통해 인증 관련 데이터 구조를 정의합니다. 여기에는 사용자 정보, 인증 상태, 폼 데이터 타입 등이 포함됩니다.

### 5. 대시보드 (pages/Dashboard.tsx)
인증된 사용자의 정보를 표시하고 프로필을 관리할 수 있는 페이지입니다. AWS Cognito에서 사용자 속성을 가져와 표시합니다.

## 오류 디버깅 및 주의사항

1. **타입 오류**: `loading`과 `isLoading` 사이의 불일치로 인한 타입 오류가 발생할 수 있습니다. `AuthState` 인터페이스에는 `isLoading`을 사용하고 있어야 합니다.

2. **Amplify 버전 호환성**: 이 프로젝트는 Amplify v6를 사용합니다. 이전 버전과는 API가 다를 수 있으므로 문서를 참조하세요.

3. **환경 변수**: `.env` 파일이 올바르게 설정되어 있는지 확인하세요. 환경 변수가 누락되면 인증 기능이 작동하지 않습니다.

4. **SECRET_HASH 관련 오류**: 앱 클라이언트에 시크릿이 설정되어 있을 경우, `secretHash.ts` 유틸리티를 사용하여 `SECRET_HASH`를 계산해야 합니다.

## 프로젝트 설정

### 선행 조건

- Node.js 설치 (v16 이상 권장)
- AWS 계정
- AWS Cognito User Pool 생성 및 설정

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
```

### 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

## AWS Cognito 주요 개념

### User Pool (사용자 풀)

- 사용자 디렉터리로, 가입, 로그인, 계정 복구 등의 기능을 제공
- 사용자 속성, 비밀번호 정책, MFA 등을 관리

### 회원가입 필수 속성 설정

현재 Cognito 사용자 풀에서 회원가입 시 필수로 입력받는 속성은 다음과 같습니다:
- **email**: 사용자의 이메일 주소 (인증 및 식별에 사용)
- **given_name**: 사용자의 이름

이 설정은 AWS Cognito 콘솔에서 변경할 수 있습니다:
1. AWS 콘솔에서 "Cognito" 서비스로 이동
2. "User Pools" 메뉴에서 해당 사용자 풀을 선택
3. 왼쪽 메뉴에서 "Sign-up experience"를 클릭
4. "Attribute" 섹션에서 "Required attributes"를 확인하고 수정

필수 속성을 변경할 경우, 프론트엔드 코드(`Register.tsx`)에서도 해당 필드를 추가하거나 수정해야 합니다.

### App Client (앱 클라이언트)

- 사용자 풀에 접근하는 애플리케이션 클라이언트
- 클라이언트 ID와 선택적으로 클라이언트 시크릿 포함

### 인증 흐름

1. **등록 (Register)**: 사용자 정보를 입력받아 Cognito User Pool에 등록
2. **확인 (Verification)**: 이메일 인증 코드로 사용자 확인
3. **로그인 (Login)**: 사용자 자격 증명으로 인증, 성공 시 토큰 발급
4. **토큰 관리**: IdToken, AccessToken, RefreshToken을 로컬에 저장하여 인증 상태 유지
5. **로그아웃**: 세션 종료 및 토큰 삭제

## 주요 컴포넌트 설명

### 인증 관련 컴포넌트

- **Login.tsx**: 로그인 폼 및 인증 처리
- **Register.tsx**: 회원가입 폼 및 사용자 등록 처리
- **VerifyEmail.tsx**: 이메일 인증 코드 확인 처리
- **ProtectedRoute.tsx**: 인증된 사용자만 접근 가능한 경로 보호

### 사용자 데이터 관련 컴포넌트

- **Dashboard.tsx**: 인증된 사용자의 정보 표시 및 관리
- **App.tsx**: 라우팅 및 애플리케이션 초기화

## AWS SDK 직접 사용 예시

이 프로젝트는 AWS Amplify의 고수준 API와 함께 AWS SDK 클라이언트를 직접 사용하여 Cognito 서비스에 접근하는 방법도 보여줍니다:

```typescript
// AWS SDK로 직접 인증 요청 보내기
const client = new CognitoIdentityProviderClient({ region });
const initiateAuthCommand = new InitiateAuthCommand({
  ClientId: clientId,
  AuthFlow: 'USER_PASSWORD_AUTH',
  AuthParameters: {
    USERNAME: email,
    PASSWORD: password
  }
});

const response = await client.send(initiateAuthCommand);
```

## 에러 처리

프로젝트의 인증 관련 에러 처리는 `handleAuthError` 함수를 통해 일관되게 관리됩니다:

- 잘못된 자격 증명 (NotAuthorizedException)
- 인증되지 않은 사용자 (UserNotConfirmedException) 
- 사용자 존재 여부 (UserNotFoundException)
- 비밀번호 복잡성 요구사항 불충족 (InvalidPasswordException)

## 보안 고려사항

- 모든 API 요청은 HTTPS를 통해 이루어집니다
- 토큰은 클라이언트 측에 안전하게 저장됩니다
- 민감한 인증 정보는 환경 변수로 관리됩니다

## 부가 정보

### Cognito 사용자 관리와 데이터베이스 통합

AWS Cognito는 사용자 관리 시스템을 자체적으로 제공하기 때문에 기본적인 인증 및 사용자 정보 관리를 위한 별도의 RDS(관계형 데이터베이스)를 구축할 필요가 없습니다. AWS 콘솔의 Cognito 서비스 > User Pool > Users 탭에서 등록된 사용자 목록과 상세 정보를 관리할 수 있습니다.

**Cognito만으로 충분한 경우**:
- 기본적인 사용자 인증(로그인, 회원가입, 비밀번호 관리)
- 표준 사용자 프로필 정보 저장
- 소셜 로그인 연동

**추가 데이터베이스가 필요한 경우**:
- 사용자와 연결된 복잡한 관계형 데이터 저장
- 사용자 활동 로그, 상세 프로필 등 추가 정보 관리
- 고급 검색 및 분석 기능

실제 서비스 구현 시에는 Cognito를 인증 서비스로 사용하고, 추가적인 사용자 관련 데이터는 별도 데이터베이스에 저장하는 하이브리드 접근 방식이 일반적입니다.

## 참고 자료

- [AWS Cognito 개발자 가이드](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [AWS Amplify 문서](https://docs.amplify.aws/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
