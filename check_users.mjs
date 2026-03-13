import { db } from './backend/config/firebase.js';

async function listUsers() {
  try {
    const snapshot = await db.collection('users').get();
    console.log(`Total users found: ${snapshot.size}`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}, Role: ${data.role}, Name: ${data.name}, Email: ${data.email}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
}

listUsers();
