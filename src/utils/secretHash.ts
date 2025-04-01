import CryptoJS from 'crypto-js';

/**
 * SECRET_HASH를 생성하는 함수
 * @param username - 사용자 이름(이메일)
 * @param clientId - 앱 클라이언트 ID
 * @param clientSecret - 앱 클라이언트 시크릿
 * @returns Cognito에 필요한 SECRET_HASH 값
 */
export function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  const message = username + clientId;
  const hmac = CryptoJS.HmacSHA256(message, clientSecret);
  return hmac.toString(CryptoJS.enc.Base64);
} 