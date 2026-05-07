import { connectDB } from "@workspace/db";
import app from "../src/app.js";

let dbConnected = false;

async function ensureDb() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

export default async function handler(req: any, res: any) {
  await ensureDb();
  return app(req, res);
}
