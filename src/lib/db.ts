import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = 'auto_post'; // Tên database bạn dùng

let cachedClient: MongoClient | null = null;

async function connectDB() {
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  }
  return cachedClient.db(dbName);
}

// Truy vấn user theo email trong collection 'admin'
export async function getUserByEmail(email: string) {
  const db = await connectDB();
  const user = await db.collection('admin').findOne({ email });
  return user;
}
