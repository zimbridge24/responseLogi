# Nuxt3 + Firebase 견적 플랫폼

역할 기반 라우팅을 지원하는 견적 요청 플랫폼입니다.

## 기능

### 역할별 기능
- **고객 (Customer)**: 견적 요청, 채팅
- **파트너 (Partner)**: 견적 제출, 채팅
- **관리자 (Admin)**: 요청/견적/파트너 관리

### 주요 기능
- Firebase Authentication & Firestore
- Pinia 상태 관리
- Vee-Validate + Yup 폼 검증
- Tailwind CSS 스타일링
- 역할 기반 라우팅 미들웨어

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
`.env` 파일을 생성하고 Firebase 설정을 추가하세요:
```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

3. 개발 서버 실행
```bash
npm run dev
```

## 프로젝트 구조

```
├── components/          # Vue 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── RequestForm.vue # 견적 요청 폼
│   ├── BidForm.vue     # 견적 제출 폼
│   └── BidsTable.vue   # 견적 목록 테이블
├── composables/        # Vue 컴포저블
│   └── useFormValidation.ts
├── lib/                # 라이브러리 및 서비스
│   ├── types.ts        # TypeScript 타입 정의
│   └── services/       # Firestore 서비스
├── middleware/         # 라우팅 미들웨어
│   ├── auth.global.ts  # 인증 미들웨어
│   ├── role-customer.ts
│   ├── role-partner.ts
│   └── role-admin.ts
├── pages/              # 페이지
│   ├── index.vue       # 랜딩 페이지
│   ├── login.vue       # 로그인
│   ├── register.vue    # 회원가입
│   ├── customer/       # 고객 페이지
│   ├── partner/        # 파트너 페이지
│   └── admin/          # 관리자 페이지
├── plugins/            # Nuxt 플러그인
│   └── firebase.ts     # Firebase 설정
└── stores/             # Pinia 스토어
    ├── user.ts         # 사용자 스토어
    ├── requests.ts     # 요청 스토어
    ├── bids.ts         # 견적 스토어
    └── chats.ts        # 채팅 스토어
```

## Firestore 컬렉션

- `users`: 사용자 정보
- `requests`: 견적 요청
- `bids`: 견적 제출
- `chats`: 채팅방
- `chatMessages`: 채팅 메시지
- `notifications`: 알림
- `companies`: 회사 정보

## 사용된 기술

- **Frontend**: Nuxt3, Vue3, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Backend**: Firebase (Auth, Firestore)
- **Form Validation**: Vee-Validate + Yup
- **UI Components**: 커스텀 컴포넌트

## 라이선스

MIT