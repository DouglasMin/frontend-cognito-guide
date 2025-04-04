import React, { useState } from 'react';

interface UserClaimInfo {
  name?: string;
  email?: string;
  userId?: string;
  isEmailVerified?: boolean;
}

interface CredentialResponse {
  claims?: {
    sub?: string;
    email?: string;
    email_verified?: string;
    given_name?: string;
    [key: string]: any;
  };
  requestInfo?: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
  };
}

// 환경 변수에서 API 엔드포인트 가져오기 (없으면 기본값 사용)
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://0rz7e4p6kl.execute-api.ap-northeast-2.amazonaws.com/prod1/mycred';

const CredentialsCheck: React.FC = () => {
  const [credInfo, setCredInfo] = useState<CredentialResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCredentials = async () => {
    setLoading(true);
    setError(null);

    try {
      // ID 토큰 사용
      const token = localStorage.getItem('idToken');
      
      if (!token) {
        throw new Error('ID 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('API 요청 실패: ' + response.statusText);
      }

      const data = await response.json();
      console.log('인증 정보:', data);
      setCredInfo(data);
    } catch (err: any) {
      console.error('인증 정보 확인 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 클레임 정보에서 필요한 정보만 추출
  const getUserInfo = (claims: any): UserClaimInfo => {
    if (!claims) return {};
    
    return {
      name: claims.given_name || '이름 없음',
      email: claims.email || '이메일 없음',
      userId: claims.sub || '사용자 ID 없음',
      isEmailVerified: claims.email_verified === 'true'
    };
  };

  const formatHeadersInfo = (headers: Record<string, string> = {}) => {
    const importantHeaders = [
      'Authorization',
      'User-Agent',
      'origin'
    ];

    return Object.entries(headers)
      .filter(([key]) => importantHeaders.includes(key))
      .reduce((obj, [key, value]) => {
        if (key === 'Authorization' && value.length > 40) {
          obj[key] = value.substring(0, 40) + '...';
        } else {
          obj[key] = value;
        }
        return obj;
      }, {} as Record<string, string>);
  };

  return (
    <div className="cred-check-container">
      <h2>인증 정보 확인</h2>
      
      <button 
        onClick={checkCredentials}
        disabled={loading}
        className="check-button"
      >
        {loading ? '확인 중...' : '인증 정보 확인'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {credInfo && credInfo.claims && (
        <div className="cred-info">
          <h3>사용자 정보</h3>
          <div className="info-grid">
            {Object.entries(getUserInfo(credInfo.claims)).map(([key, value]) => (
              <div key={key} className="info-row">
                <div className="info-label">
                  {(() => {
                    switch(key) {
                      case 'name': return '이름';
                      case 'email': return '이메일';
                      case 'userId': return '사용자 ID';
                      case 'isEmailVerified': return '이메일 인증됨';
                      default: return key;
                    }
                  })()}:
                </div>
                <div className="info-value">
                  {typeof value === 'boolean' ? (value ? '예' : '아니오') : value}
                </div>
              </div>
            ))}
          </div>

          <h3>요청 정보</h3>
          <div className="info-grid">
            <div className="info-row">
              <div className="info-label">메서드:</div>
              <div className="info-value">{credInfo.requestInfo?.method}</div>
            </div>
            <div className="info-row">
              <div className="info-label">경로:</div>
              <div className="info-value">{credInfo.requestInfo?.path}</div>
            </div>
          </div>

          <h3>중요 헤더</h3>
          <div className="info-grid">
            {Object.entries(formatHeadersInfo(credInfo.requestInfo?.headers)).map(([key, value]) => (
              <div key={key} className="info-row">
                <div className="info-label">{key}:</div>
                <div className="info-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          .cred-check-container {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .check-button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 20px;
          }
          
          .check-button:disabled {
            background-color: #ccc;
          }
          
          .error-message {
            color: #dc3545;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #dc3545;
            border-radius: 4px;
          }
          
          .cred-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            overflow-x: auto;
          }
          
          .cred-info h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #dee2e6;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .info-row {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
            align-items: center;
          }
          
          .info-label {
            font-weight: bold;
            color: #495057;
          }
          
          .info-value {
            word-break: break-word;
          }
          
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        `}
      </style>
    </div>
  );
};

export default CredentialsCheck; 