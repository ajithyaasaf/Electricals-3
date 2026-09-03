import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function clearOrders() {
  console.log('🔍 Fetching orders, order items, and order history from Firestore...');

  const ordersSnap = await db.collection('orders').get();
  const orderItemsSnap = await db.collection('orderItems').get();
  const orderHistorySnap = await db.collection('orderHistory').get();

  console.log(`📦 Found ${ordersSnap.size} order(s) in 'orders'`);
  console.log(`📋 Found ${orderItemsSnap.size} item(s) in 'orderItems'`);
  console.log(`📜 Found ${orderHistorySnap.size} history record(s) in 'orderHistory'`);

  if (ordersSnap.empty && orderItemsSnap.empty && orderHistorySnap.empty) {
    console.log('✨ No orders found to delete. Database is already clean.');
    return;
  }

  // Delete in batches of up to 400 operations (Firestore limit is 500)
  let batch = db.batch();
  let opCount = 0;
  let totalDeleted = 0;

  const commitBatchIfNeeded = async (force = false) => {
    if (opCount > 0 && (opCount >= 400 || force)) {
      await batch.commit();
      totalDeleted += opCount;
      console.log(`   Deleted ${totalDeleted} documents so far...`);
      batch = db.batch();
      opCount = 0;
    }
  };

  // 1. Delete orderHistory
  for (const doc of orderHistorySnap.docs) {
    batch.delete(doc.ref);
    opCount++;
    await commitBatchIfNeeded();
  }

  // 2. Delete orderItems
  for (const doc of orderItemsSnap.docs) {
    batch.delete(doc.ref);
    opCount++;
    await commitBatchIfNeeded();
  }

  // 3. Delete orders
  for (const doc of ordersSnap.docs) {
    // Also check for any subcollections under each order
    const subcollections = await doc.ref.listCollections();
    for (const subcol of subcollections) {
      const subSnap = await subcol.get();
      for (const subDoc of subSnap.docs) {
        batch.delete(subDoc.ref);
        opCount++;
        await commitBatchIfNeeded();
      }
    }

    batch.delete(doc.ref);
    opCount++;
    await commitBatchIfNeeded();
  }

  await commitBatchIfNeeded(true);

  console.log(`\n🎉 Successfully cleared all test orders!`);
  console.log(`   - Orders deleted: ${ordersSnap.size}`);
  console.log(`   - Order items deleted: ${orderItemsSnap.size}`);
  console.log(`   - Order history records deleted: ${orderHistorySnap.size}`);
}

clearOrders().catch((err) => {
  console.error('❌ Error clearing orders:', err);
  process.exit(1);
});
