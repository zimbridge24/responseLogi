import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Helper: Count bids for a request
async function countBids(reqId: string): Promise<number> {
  const bidsSnap = await admin.firestore()
    .collection('requests').doc(reqId).collection('bids').get();
  return bidsSnap.size;
}

// Cloud Function: placeBid
export const placeBid = functions.https.onCall(async (data, context) => {
  const { reqId, bid } = data;
  const uid = context.auth?.uid;
  const role = context.auth?.token?.role;

  if (!uid || role !== 'partner') {
    throw new functions.https.HttpsError('permission-denied', 'Only partners can place bids.');
  }

  const bidCount = await countBids(reqId);
  if (bidCount >= 7) {
    throw new functions.https.HttpsError('resource-exhausted', 'Max 7 bids per request.');
  }

  bid.partnerId = uid;
  await admin.firestore()
    .collection('requests').doc(reqId).collection('bids').add(bid);

  return { success: true };
});

// Cloud Function: onRequestCreated
export const onRequestCreated = functions.firestore
  .document('requests/{reqId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    // Find routed partners (implement your routing logic here)
    const partnersSnap = await admin.firestore()
      .collection('users')
      .where('role', '==', 'partner')
      .get();

    const tokens: string[] = [];
    for (const doc of partnersSnap.docs) {
      const tokenDoc = await admin.firestore()
        .collection('userTokens').doc(doc.id).get();
      if (tokenDoc.exists && tokenDoc.data()?.token) {
        tokens.push(tokenDoc.data().token);
      }
    }

    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: 'New Request Available',
          body: `A new request has been posted.`,
        },
        data: {
          reqId: context.params.reqId,
        },
      });
    }
  });import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Helper: Count bids for a request
async function countBids(reqId: string): Promise<number> {
  const bidsSnap = await admin.firestore()
    .collection('requests').doc(reqId).collection('bids').get();
  return bidsSnap.size;
}

// Cloud Function: placeBid
export const placeBid = functions.https.onCall(async (data, context) => {
  const { reqId, bid } = data;
  const uid = context.auth?.uid;
  const role = context.auth?.token?.role;

  if (!uid || role !== 'partner') {
    throw new functions.https.HttpsError('permission-denied', 'Only partners can place bids.');
  }

  const bidCount = await countBids(reqId);
  if (bidCount >= 7) {
    throw new functions.https.HttpsError('resource-exhausted', 'Max 7 bids per request.');
  }

  bid.partnerId = uid;
  await admin.firestore()
    .collection('requests').doc(reqId).collection('bids').add(bid);

  return { success: true };
});

// Cloud Function: onRequestCreated
export const onRequestCreated = functions.firestore
  .document('requests/{reqId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    // Find routed partners (implement your routing logic here)
    const partnersSnap = await admin.firestore()
      .collection('users')
      .where('role', '==', 'partner')
      .get();

    const tokens: string[] = [];
    for (const doc of partnersSnap.docs) {
      const tokenDoc = await admin.firestore()
        .collection('userTokens').doc(doc.id).get();
      if (tokenDoc.exists && tokenDoc.data()?.token) {
        tokens.push(tokenDoc.data().token);
      }
    }

    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: 'New Request Available',
          body: `A new request has been posted.`,
        },
        data: {
          reqId: context.params.reqId,
        },
      });
    }
  });