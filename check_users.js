import { db } from './backend/config/firebase.js';

async function listUsers() {
  try {
    const snapshot = await db.collection('users').get();
    console.log(`Total users found: ${snapshot.size}`);
    snapshot.forEach(doc => {
      console.log(`ID: ${doc.id}, Role: ${doc.data().role}, Name: ${doc.data().name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
