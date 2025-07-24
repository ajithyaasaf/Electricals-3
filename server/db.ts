// Firestore database connection and configuration
// Migrated from PostgreSQL to Firestore for better scalability and modern NoSQL approach

export { db, auth } from '@shared/firestore';
export * from './firestoreService';