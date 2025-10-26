import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod;

export async function connectTestDB() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGO_URI = uri;
  process.env.DBNAME = "foodexpress_test";

  try { await mongoose.disconnect(); } catch {}
  await mongoose.connect(uri, { dbName: process.env.DBNAME });
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
}