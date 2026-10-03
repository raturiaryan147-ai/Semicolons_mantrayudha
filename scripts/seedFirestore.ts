import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import { IMPORTED_PRODUCTS } from '../src/data/importedProducts';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function sanitizeForFirestore(data) {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(item => sanitizeForFirestore(item));
  if (typeof data === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleaned[k] = sanitizeForFirestore(v);
    }
    return cleaned;
  }
  return data;
}

async function run() {
  console.log(`Starting Firestore sync of ${IMPORTED_PRODUCTS.length} products...`);
  const batch = writeBatch(db);
  IMPORTED_PRODUCTS.forEach(product => {
    const ref = doc(db, 'products', product.id);
    batch.set(ref, sanitizeForFirestore(product), { merge: true });
  });

  await batch.commit();
  console.log(`Successfully seeded ${IMPORTED_PRODUCTS.length} products directly to Firestore!`);
  process.exit(0);
}

run().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
