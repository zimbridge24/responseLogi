import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * 파트너 응찰 함수
 */
export const placeBid = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
  }

  if (
    auth.token.role !== "partner" ||
    auth.token.status !== "approved"
  ) {
    throw new HttpsError(
      "permission-denied",
      "승인된 파트너만 응찰할 수 있습니다."
    );
  }

  const { requestId, bid } = data;
  const partnerId = auth.uid;

  const bidsRef = db.collection("requests").doc(requestId).collection("bids");
  const snapshot = await bidsRef.where("partnerId", "==", partnerId).get();

  if (!snapshot.empty) {
    throw new HttpsError("already-exists", "이미 응찰을 제출했습니다.");
  }

  const countSnap = await bidsRef.get();
  if (countSnap.size >= 7) {
    throw new HttpsError(
      "resource-exhausted",
      "이 요청은 이미 7개 견적을 받았습니다."
    );
  }

  await bidsRef.add({
    ...bid,
    partnerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Admin이 파트너 승인
 */
export const approvePartner = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth || auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "관리자만 승인할 수 있습니다.");
  }

  const { uid } = data;
  await admin
    .auth()
    .setCustomUserClaims(uid, { role: "partner", status: "approved" });

  return { success: true };
});


/**
 * 창고 견적서 생성 시 고객에게 알림
 */
export const onWarehouseQuoteCreated = onDocumentCreated(
  "warehouseQuotes/{quoteId}",
  async (event) => {
    const quoteId = event.params.quoteId;
    const quoteData = event.data?.data();

    if (!quoteData) return;

    console.log("새로운 견적서 생성됨:", quoteId);

    const requestSnap = await db
      .collection("warehouseRequests")
      .doc(quoteData.requestId)
      .get();
    const requestData = requestSnap.data();

    if (requestData) {
      const customerSnap = await db
        .collection("users")
        .doc(requestData.customerId)
        .get();
      const customerData = customerSnap.data();

      if (customerData?.fcmToken) {
        try {
          await admin.messaging().send({
            token: customerData.fcmToken,
            notification: {
              title: "견적 응답 도착",
              body: "신청하신 견적에 대한 응답이 왔습니다.",
            },
            data: {
              requestId: quoteData.requestId,
              quoteId,
              click_action: "/customer/requests",
            },
          });
          console.log("고객에게 웹푸시 전송 성공");
        } catch (error) {
          console.error("고객에게 웹푸시 전송 실패:", error);
        }
      }
    }
  }
);

/**
 * 창고 견적서 수락 시 파트너에게 알림
 */
export const onWarehouseQuoteAccepted = onDocumentUpdated(
  "warehouseQuotes/{quoteId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const quoteId = event.params.quoteId;

    if (!beforeData || !afterData) return;

    console.log(
      "견적서 상태 변경됨:",
      quoteId,
      "이전:",
      beforeData.status,
      "이후:",
      afterData.status
    );

    if (beforeData.status !== "accepted" && afterData.status === "accepted") {
      const partnerSnap = await db
        .collection("users")
        .doc(afterData.partnerId)
        .get();
      const partnerData = partnerSnap.data();

      if (partnerData?.fcmToken) {
        try {
          await admin.messaging().send({
            token: partnerData.fcmToken,
            notification: {
              title: "견적서 수락됨",
              body: "고객이 귀하의 견적서를 수락했습니다!",
            },
            data: {
              requestId: afterData.requestId,
              quoteId,
              click_action: "/partner/completed-quotes",
            },
          });
          console.log("파트너에게 웹푸시 전송 성공");
        } catch (error) {
          console.error("파트너에게 웹푸시 전송 실패:", error);
        }
      }
    }
  }
);

/**
 * 새로운 채팅 메시지 시 상대방에게 웹푸시 알림
 */
export const onChatMessageCreated = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const messageData = event.data?.data();
    const chatId = event.params.chatId;
    const messageId = event.params.messageId;

    if (!messageData) return;

    console.log("새로운 채팅 메시지 생성됨:", messageId);

    try {
      // 채팅 정보 가져오기
      const chatSnap = await db.collection("chats").doc(chatId).get();
      const chatData = chatSnap.data();

      if (!chatData) return;

      // 메시지 보낸 사람이 아닌 상대방 찾기
      const senderId = messageData.senderId;
      const receiverId = senderId === chatData.customerId ? chatData.partnerId : chatData.customerId;

      // 상대방 정보 가져오기
      const receiverSnap = await db.collection("users").doc(receiverId).get();
      const receiverData = receiverSnap.data();

      if (receiverData?.fcmToken) {
        // 보낸 사람 정보 가져오기
        const senderSnap = await db.collection("users").doc(senderId).get();
        const senderData = senderSnap.data();

        try {
          await admin.messaging().send({
            token: receiverData.fcmToken,
            notification: {
              title: senderData?.name || "알 수 없음",
              body: messageData.text || "새로운 메시지가 도착했습니다.",
            },
            data: {
              chatId,
              messageId,
              senderId,
              click_action: `/chat/${chatId}`,
            },
          });
          console.log("채팅 메시지 웹푸시 전송 성공");
        } catch (error) {
          console.error("채팅 메시지 웹푸시 전송 실패:", error);
        }
      }
    } catch (error) {
      console.error("채팅 메시지 웹푸시 처리 실패:", error);
    }
  }
);