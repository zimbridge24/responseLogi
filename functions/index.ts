import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin 초기화
admin.initializeApp();

// 1. 새로운 메시지가 생성될 때 푸시 알림 전송
export const onMessageCreated = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const chatId = context.params.chatId;
      const messageId = context.params.messageId;

      console.log('새 메시지 생성:', { chatId, messageId, message });

      // 채팅 정보 가져오기
      const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
      if (!chatDoc.exists) {
        console.log('채팅 정보를 찾을 수 없습니다:', chatId);
        return;
      }

      const chatData = chatDoc.data();
      const senderId = message.senderId;
      
      // 수신자 ID 찾기 (senderId가 아닌 다른 사용자)
      const receiverId = senderId === chatData?.customerId ? chatData?.partnerId : chatData?.customerId;
      
      if (!receiverId) {
        console.log('수신자를 찾을 수 없습니다');
        return;
      }

      // 수신자의 FCM 토큰 가져오기
      const userDoc = await admin.firestore().collection('users').doc(receiverId).get();
      if (!userDoc.exists) {
        console.log('사용자 정보를 찾을 수 없습니다:', receiverId);
        return;
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log('FCM 토큰을 찾을 수 없습니다:', receiverId);
        return;
      }

      // 푸시 알림 전송
      const payload = {
        notification: {
          title: '새로운 메시지',
          body: message.text || '새로운 메시지가 도착했습니다.',
        },
        data: {
          chatId: chatId,
          messageId: messageId,
          click_action: `/chat/${chatId}`,
        },
        token: fcmToken,
      };

      await admin.messaging().send(payload);
      console.log('메시지 알림 전송 완료:', receiverId);

    } catch (error) {
      console.error('메시지 알림 전송 실패:', error);
    }
  });

// 2. 고객이 견적확정 버튼을 눌렀을 때 푸시 알림 전송
export const onRequestStatusUpdated = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const requestId = context.params.requestId;

      // status가 "confirmed"로 변경되었는지 확인
      if (beforeData.status !== 'confirmed' && afterData.status === 'confirmed') {
        console.log('견적이 확정되었습니다:', requestId);

        // 해당 요청의 partnerId 찾기
        const partnerId = afterData.partnerId;
        if (!partnerId) {
          console.log('파트너 ID를 찾을 수 없습니다');
          return;
        }

        // 파트너의 FCM 토큰 가져오기
        const userDoc = await admin.firestore().collection('users').doc(partnerId).get();
        if (!userDoc.exists) {
          console.log('파트너 정보를 찾을 수 없습니다:', partnerId);
          return;
        }

        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) {
          console.log('파트너 FCM 토큰을 찾을 수 없습니다:', partnerId);
          return;
        }

        // 푸시 알림 전송
        const payload = {
          notification: {
            title: '견적이 확정되었습니다',
            body: '고객이 견적을 확정했습니다.',
          },
          data: {
            requestId: requestId,
            click_action: `/partner/completed-quotes`,
          },
          token: fcmToken,
        };

        await admin.messaging().send(payload);
        console.log('견적 확정 알림 전송 완료:', partnerId);
      }

    } catch (error) {
      console.error('견적 확정 알림 전송 실패:', error);
    }
  });

// 3. 파트너가 고객의 견적신청에 응답했을 때 푸시 알림 전송
export const onBidCreated = functions.firestore
  .document('requests/{requestId}/bids/{bidId}')
  .onCreate(async (snap, context) => {
    try {
      const bid = snap.data();
      const requestId = context.params.requestId;
      const bidId = context.params.bidId;

      console.log('새 견적 응답 생성:', { requestId, bidId, bid });

      // 해당 요청의 customerId 찾기
      const requestDoc = await admin.firestore().collection('requests').doc(requestId).get();
      if (!requestDoc.exists) {
        console.log('요청 정보를 찾을 수 없습니다:', requestId);
        return;
      }

      const requestData = requestDoc.data();
      const customerId = requestData?.customerId;

      if (!customerId) {
        console.log('고객 ID를 찾을 수 없습니다');
        return;
      }

      // 고객의 FCM 토큰 가져오기
      const userDoc = await admin.firestore().collection('users').doc(customerId).get();
      if (!userDoc.exists) {
        console.log('고객 정보를 찾을 수 없습니다:', customerId);
        return;
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log('고객 FCM 토큰을 찾을 수 없습니다:', customerId);
        return;
      }

      // 푸시 알림 전송
      const payload = {
        notification: {
          title: '새로운 견적 응답',
          body: '파트너가 견적을 등록했습니다.',
        },
        data: {
          requestId: requestId,
          bidId: bidId,
          click_action: `/customer/requests`,
        },
        token: fcmToken,
      };

      await admin.messaging().send(payload);
      console.log('견적 응답 알림 전송 완료:', customerId);

    } catch (error) {
      console.error('견적 응답 알림 전송 실패:', error);
    }
  });

// 4. 완료된 견적이 생성될 때 푸시 알림 전송 (추가 기능)
export const onCompletedQuoteCreated = functions.firestore
  .document('completedQuotes/{completedQuoteId}')
  .onCreate(async (snap, context) => {
    try {
      const completedQuote = snap.data();
      const completedQuoteId = context.params.completedQuoteId;

      console.log('완료된 견적 생성:', { completedQuoteId, completedQuote });

      // 파트너에게 알림 전송
      const partnerId = completedQuote.partnerId;
      if (partnerId) {
        const userDoc = await admin.firestore().collection('users').doc(partnerId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const fcmToken = userData?.fcmToken;

          if (fcmToken) {
            const payload = {
              notification: {
                title: '견적이 수락되었습니다',
                body: `${completedQuote.customerName}님이 견적을 수락했습니다.`,
              },
              data: {
                completedQuoteId: completedQuoteId,
                click_action: `/partner/completed-quotes`,
              },
              token: fcmToken,
            };

            await admin.messaging().send(payload);
            console.log('견적 수락 알림 전송 완료 (파트너):', partnerId);
          }
        }
      }

    } catch (error) {
      console.error('완료된 견적 알림 전송 실패:', error);
    }
  });


