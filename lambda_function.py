def lambda_handler(event, context):
    print("받은 이벤트:", event)
    
    # API Gateway 권한 부여자에서 클레임 추출
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims", {})
    print("사용자 클레임:", claims)
    
    # 요청 정보
    request_info = {
        "method": event.get("httpMethod"),
        "path": event.get("path"),
        "headers": event.get("headers", {})
    }
    print("요청 정보:", request_info)
    
    return {
        "claims": claims,
        "requestInfo": request_info
    } 