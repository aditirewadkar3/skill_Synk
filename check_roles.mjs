import { db } from './backend/config/firebase.js';

async function listUsers() {
  try {
    const snapshot = await db.collection('users').get();
    const roleCounts = {};
    snapshot.forEach(doc => {
      const role = doc.data().role || 'no-role';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    console.log('Role Distribution:', roleCounts);
    
    console.log('--- User Details ---');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id.substring(0,5)}..., Role: ${data.role}, Name: ${data.name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listUsers();
