# Firebase Cloud Messaging (FCM) 설정 가이드

## 1. Firebase Console 설정

### 1.1 Web Push 인증서 생성
1. Firebase Console → 프로젝트 설정 → 클라우드 메시징
2. "웹 푸시 인증서" 섹션에서 키 쌍 생성
3. 생성된 VAPID 키를 복사하여 `.env` 파일에 설정

### 1.2 서비스 워커 등록
1. Firebase Console → 프로젝트 설정 → 일반
2. "웹 앱" 섹션에서 앱 추가
3. 서비스 워커 파일 경로: `/firebase-messaging-sw.js`

## 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Firebase 설정
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# VAPID Key (Web Push 인증서)
NUXT_PUBLIC_FCM_VAPID_KEY=BNQtR61qKjsE_43bqyg6g4Uoz7lYuwEZNFafwFHBRRrnbS0QUXt9K6SOXo7Wk1ctw5TYdbib8Uag3gcMxbLoKic
```

## 3. Cloud Functions 배포

### 3.1 Functions 의존성 설치
```bash
cd functions
npm install
```

### 3.2 Functions 빌드
```bash
npm run build
```

### 3.3 Functions 배포
```bash
firebase deploy --only functions
```

## 4. 알림 아이콘 설정

다음 파일들을 `public` 폴더에 추가하세요:
- `icon-192x192.png` (192x192 픽셀)
- `badge-72x72.png` (72x72 픽셀)

## 5. 알림 트리거

다음 3가지 경우에 푸시 알림이 전송됩니다:

### 5.1 새로운 메시지
- **트리거**: `chats/{chatId}/messages/{messageId}` 문서 생성
- **수신자**: 메시지 발신자가 아닌 채팅 참여자
- **알림 내용**: "새로운 메시지" + 메시지 내용

### 5.2 견적 확정
- **트리거**: `requests/{requestId}` 문서의 status가 "confirmed"로 변경
- **수신자**: 해당 요청의 파트너
- **알림 내용**: "견적이 확정되었습니다"

### 5.3 견적 응답
- **트리거**: `requests/{requestId}/bids/{bidId}` 문서 생성
- **수신자**: 해당 요청의 고객
- **알림 내용**: "새로운 견적 응답"

## 6. 테스트

### 6.1 브라우저 알림 권한 확인
1. 웹 애플리케이션에 로그인
2. 브라우저에서 알림 권한 요청 팝업 확인
3. "허용" 선택

### 6.2 FCM 토큰 확인
1. 개발자 도구 콘솔에서 FCM 토큰 로그 확인
2. Firestore `users/{uid}` 문서에서 `fcmToken` 필드 확인

### 6.3 알림 테스트
1. 다른 사용자와 채팅 메시지 주고받기
2. 견적 요청 및 응답 테스트
3. 백그라운드에서 알림 수신 확인

## 7. 문제 해결

### 7.1 알림이 오지 않는 경우
- 브라우저 알림 권한 확인
- FCM 토큰이 Firestore에 저장되었는지 확인
- Cloud Functions 로그 확인: `firebase functions:log`

### 7.2 서비스 워커 오류
- `firebase-messaging-sw.js` 파일이 `public` 폴더에 있는지 확인
- Firebase 설정이 올바른지 확인

### 7.3 VAPID 키 오류
- Firebase Console에서 생성한 VAPID 키와 `.env` 파일의 키가 일치하는지 확인

