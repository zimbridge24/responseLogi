// Admin 계정 생성 스크립트
// 이 스크립트는 서버에서 실행되어 Admin 계정을 생성합니다.

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA9kSJoOsJshYLWNpljdDVpZXw3NmrhLz8",
  authDomain: "responserogi.firebaseapp.com",
  projectId: "responserogi",
  storageBucket: "responserogi.firebasestorage.app",
  messagingSenderId: "697844763490",
  appId: "1:697844763490:web:0dc1a9e6bf51d5ac177a3b"
};

async function createAdminAccount() {
  try {
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Admin 계정 생성/업데이트 시작...');

    let user;
    let isNewAccount = false;

    try {
      // 먼저 기존 계정으로 로그인 시도
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', '123456');
      user = userCredential.user;
      console.log('기존 계정으로 로그인 성공:', user.uid);
    } catch (loginError) {
      if (loginError.code === 'auth/user-not-found') {
        // 계정이 없으면 새로 생성
        console.log('계정이 없어서 새로 생성합니다...');
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@admin.com', '123456');
        user = userCredential.user;
        isNewAccount = true;
        console.log('새 계정 생성 완료:', user.uid);
      } else {
        throw loginError;
      }
    }

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: 'Admin'
    });

    // Firestore에 Admin 정보 저장/업데이트
    const adminData = {
      name: 'Admin',
      email: 'admin@admin.com',
      role: 'admin',
      approvalStatus: 'approved',
      createdAt: isNewAccount ? new Date() : (await getDoc(doc(db, 'users', user.uid))).data()?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), adminData);

    console.log('Admin 계정 설정 완료!');
    console.log('이메일: admin@admin.com');
    console.log('비밀번호: 123456');
    console.log('UID:', user.uid);

  } catch (error) {
    console.error('Admin 계정 설정 실패:', error);
  }
}

createAdminAccount();
