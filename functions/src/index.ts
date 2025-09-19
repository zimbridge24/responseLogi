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
// 요청 생성 시 모든 파트너에게 알림
export const onRequestCreated = functions.firestore
  .document('requests/{reqId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const partnersSnap = await db.collection('users').where('role', '==', 'partner').get();

    const tokens: string[] = [];
    for (const doc of partnersSnap.docs) {
      const tokenDoc = await db.collection('userTokens').doc(doc.id).get();
      if (tokenDoc.exists && tokenDoc.data()?.token) {
        tokens.push(tokenDoc.data().token);
      }
    }

    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: '새로운 견적 요청',
          body: `온도대: ${requestData.temperature}, 지역: ${requestData.location}, 팔렛 수: ${requestData.palletCount}`,
        },
        data: {
          reqId: context.params.reqId,
        },
      });
    }
  });

// 응찰 생성 시 고객에게 알림
export const onBidCreated = functions.firestore
  .document('requests/{reqId}/bids/{bidId}')
  .onCreate(async (snap, context) => {
    const bidData = snap.data();
    const requestSnap = await db.collection('requests').doc(context.params.reqId).get();
    const requestData = requestSnap.data();

    if (requestData) {
      const tokenDoc = await db.collection('userTokens').doc(requestData.sellerId).get();
      if (tokenDoc.exists && tokenDoc.data()?.token) {
        await admin.messaging().send({
          token: tokenDoc.data().token,
          notification: {
            title: '새로운 응찰 도착',
            body: `파트너가 새로운 응찰을 제출했습니다.`,
          },
          data: {
            reqId: context.params.reqId,
            bidId: context.params.bidId,
          },
        });
      }
    }
  });