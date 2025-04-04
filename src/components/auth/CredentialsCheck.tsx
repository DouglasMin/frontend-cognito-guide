import React, { useEffect, useState } from 'react';
import { CognitoIdentityProviderClient, ListUserPoolsCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

/**
 * Cognito 자격 증명 확인 컴포넌트
 * 현재 설정된 Cognito 사용자 풀 및 사용자 정보를 확인
 */
const CredentialsCheck: React.FC = () => {
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [usersInfo, setUsersInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCognitoConfig = async () => {
      try {
        setLoading(true);
        const region = import.meta.env.VITE_COGNITO_REGION || 'ap-northeast-2';
        const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        
        console.log('사용 중인 Cognito 설정:', {
          region,
          userPoolId,
          clientId
        });
        
        // 사용자 풀 정보 확인
        const client = new CognitoIdentityProviderClient({ region });
        
        // 사용자 풀 목록 조회 (최대 60개)
        try {
          const listPoolsCommand = new ListUserPoolsCommand({ MaxResults: 60 });
          const poolsResponse = await client.send(listPoolsCommand);
          
          const pools = poolsResponse.UserPools || [];
          const targetPool = pools.find(pool => pool.Id === userPoolId);
          
          setPoolInfo({
            found: !!targetPool,
            poolId: userPoolId,
            poolName: targetPool?.Name || 'Not Found',
            totalPools: pools.length,
            allPoolIds: pools.map(p => p.Id)
          });
        } catch (poolError: any) {
          console.error('사용자 풀 조회 오류:', poolError);
          setPoolInfo({
            error: poolError.message,
            found: false
          });
        }
        
        // 사용자 목록 조회 (최대 10명)
        if (userPoolId) {
          try {
            const listUsersCommand = new ListUsersCommand({
              UserPoolId: userPoolId,
              Limit: 10
            });
            
            const usersResponse = await client.send(listUsersCommand);
            const users = usersResponse.Users || [];
            
            setUsersInfo({
              totalUsers: users.length,
              users: users.map(user => ({
                username: user.Username,
                enabled: user.Enabled,
                status: user.UserStatus,
                created: user.UserCreateDate
              }))
            });
          } catch (usersError: any) {
            console.error('사용자 목록 조회 오류:', usersError);
            setUsersInfo({
              error: usersError.message
            });
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Cognito 설정 확인 오류:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    checkCognitoConfig();
  }, []);

  if (loading) {
    return <div>Cognito 설정 확인 중...</div>;
  }

  if (error) {
    return <div>오류 발생: {error}</div>;
  }

  return (
    <div className="credentials-check">
      <h1>Cognito 설정 확인</h1>
      
      <div className="check-section">
        <h2>환경 변수 설정</h2>
        <pre>
          {JSON.stringify({
            REGION: import.meta.env.VITE_COGNITO_REGION,
            USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
            CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID?.substring(0, 5) + '...',
            HAS_CLIENT_SECRET: !!import.meta.env.VITE_COGNITO_CLIENT_SECRET,
            HAS_DOMAIN_PREFIX: !!import.meta.env.VITE_COGNITO_DOMAIN_PREFIX
          }, null, 2)}
        </pre>
      </div>
      
      <div className="check-section">
        <h2>사용자 풀 정보</h2>
        {poolInfo ? (
          <pre>{JSON.stringify(poolInfo, null, 2)}</pre>
        ) : (
          <p>사용자 풀 정보를 확인할 수 없습니다.</p>
        )}
      </div>
      
      <div className="check-section">
        <h2>사용자 목록 정보 ({import.meta.env.VITE_COGNITO_USER_POOL_ID})</h2>
        {usersInfo ? (
          <pre>{JSON.stringify(usersInfo, null, 2)}</pre>
        ) : (
          <p>사용자 목록을 확인할 수 없습니다.</p>
        )}
      </div>
      
      <style>{`
        .credentials-check {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }
        
        .check-section {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        pre {
          background-color: #eee;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default CredentialsCheck; 