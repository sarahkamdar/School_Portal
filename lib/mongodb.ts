import { MongoClient, Db } from "mongodb"

let client: MongoClient | null = null
let db: Db | null = null

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "school-portal"

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not set")

  if (db && client) return db

  if (!client) {
    client = new MongoClient(uri)
  }
  await client.connect()
  db = client.db(dbName)
  return db
}

export async function closeDb() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
