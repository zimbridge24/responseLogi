import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 파트너 응찰 함수
export const placeBid = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "로그인이 필요합니다.");
  }
  if (context.auth.token.role !== "partner" || context.auth.token.status !== "approved") {
    throw new functions.https.HttpsError("permission-denied", "승인된 파트너만 응찰할 수 있습니다.");
  }

  const { requestId, bid } = data; // bid = {입고비, 보관비, 출고비 ...}
  const partnerId = context.auth.uid;

  const bidsRef = db.collection("requests").doc(requestId).collection("bids");
  const snapshot = await bidsRef.where("partnerId", "==", partnerId).get();

  if (!snapshot.empty) {
    throw new functions.https.HttpsError("already-exists", "이미 응찰을 제출했습니다.");
  }

  const countSnap = await bidsRef.get();
  if (countSnap.size >= 7) {
    throw new functions.https.HttpsError("resource-exhausted", "이 요청은 이미 7개 견적을 받았습니다.");
  }

  await bidsRef.add({
    ...bid,
    partnerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// Admin이 파트너 승인
export const approvePartner = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "관리자만 승인할 수 있습니다.");
  }

  const { uid } = data;
  await admin.auth().setCustomUserClaims(uid, { role: "partner", status: "approved" });
  return { success: true };
});

// 창고 견적 신청 생성 시 모든 파트너에게 알림
export const onWarehouseRequestCreated = functions.firestore
  .document('warehouseRequests/{requestId}')
  .onCreate(async (snap, context) => {
    console.log('새로운 견적 신청 생성됨:', context.params.requestId);
    
    // 모든 파트너 조회
    const partnersSnap = await db.collection('users').where('role', '==', 'partner').get();
    
    console.log('파트너 수:', partnersSnap.docs.length);
    
    const tokens: string[] = [];
    for (const doc of partnersSnap.docs) {
      const userData = doc.data();
      console.log('파트너 ID:', doc.id, 'FCM 토큰:', userData.fcmToken ? '있음' : '없음');
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    }
    
    console.log('수집된 FCM 토큰 수:', tokens.length);
    
    if (tokens.length > 0) {
      try {
        // sendMulticast 대신 개별 send 사용
        const promises = tokens.map(token => 
          admin.messaging().send({
            token,
            notification: {
              title: '새로운 견적 신청',
              body: `새로운 창고 견적 신청이 등록되었습니다.`,
            },
            data: {
              requestId: context.params.requestId,
              click_action: '/',
            },
          })
        );
        
        await Promise.all(promises);
        console.log('웹푸시 전송 성공');
      } catch (error) {
        console.error('웹푸시 전송 실패:', error);
      }
    } else {
      console.log('FCM 토큰이 없어서 웹푸시를 전송하지 않습니다.');
    }
  });

// 창고 견적서 생성 시 고객에게 알림
export const onWarehouseQuoteCreated = functions.firestore
  .document('warehouseQuotes/{quoteId}')
  .onCreate(async (snap, context) => {
    const quoteData = snap.data();
    
    console.log('새로운 견적서 생성됨:', context.params.quoteId);
    
    // 견적 신청서 정보 조회
    const requestSnap = await db.collection('warehouseRequests').doc(quoteData.requestId).get();
    const requestData = requestSnap.data();
    
    if (requestData) {
      console.log('견적 신청서 찾음:', quoteData.requestId, '고객 ID:', requestData.customerId);
      
      // 고객 정보 조회
      const customerSnap = await db.collection('users').doc(requestData.customerId).get();
      const customerData = customerSnap.data();
      
      console.log('고객 정보:', customerData ? '찾음' : '없음', 'FCM 토큰:', customerData?.fcmToken ? '있음' : '없음');
      
      if (customerData && customerData.fcmToken) {
        try {
          await admin.messaging().send({
            token: customerData.fcmToken,
            notification: {
              title: '새로운 견적서 도착',
              body: `파트너가 견적서를 제출했습니다.`,
            },
            data: {
              requestId: quoteData.requestId,
              quoteId: context.params.quoteId,
              click_action: '/customer/requests',
            },
          });
          console.log('고객에게 웹푸시 전송 성공');
        } catch (error) {
          console.error('고객에게 웹푸시 전송 실패:', error);
        }
      } else {
        console.log('고객 FCM 토큰이 없어서 웹푸시를 전송하지 않습니다.');
      }
    } else {
      console.log('견적 신청서를 찾을 수 없습니다.');
    }
  });

// 창고 견적서 수락 시 파트너에게 알림
export const onWarehouseQuoteAccepted = functions.firestore
  .document('warehouseQuotes/{quoteId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    console.log('견적서 상태 변경됨:', context.params.quoteId, '이전:', beforeData.status, '이후:', afterData.status);
    
    // 상태가 'accepted'로 변경된 경우
    if (beforeData.status !== 'accepted' && afterData.status === 'accepted') {
      console.log('견적서가 수락됨, 파트너에게 알림 전송 시작');
      
      // 파트너 정보 조회
      const partnerSnap = await db.collection('users').doc(afterData.partnerId).get();
      const partnerData = partnerSnap.data();
      
      console.log('파트너 정보:', partnerData ? '찾음' : '없음', 'FCM 토큰:', partnerData?.fcmToken ? '있음' : '없음');
      
      if (partnerData && partnerData.fcmToken) {
        try {
          await admin.messaging().send({
            token: partnerData.fcmToken,
            notification: {
              title: '견적서 수락됨',
              body: `고객이 귀하의 견적서를 수락했습니다!`,
            },
            data: {
              requestId: afterData.requestId,
              quoteId: context.params.quoteId,
              click_action: '/partner/completed-quotes',
            },
          });
          console.log('파트너에게 웹푸시 전송 성공');
        } catch (error) {
          console.error('파트너에게 웹푸시 전송 실패:', error);
        }
      } else {
        console.log('파트너 FCM 토큰이 없어서 웹푸시를 전송하지 않습니다.');
      }
    }
  });