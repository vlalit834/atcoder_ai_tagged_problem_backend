import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "..", "..", "data", "problems.db");

let db = null;

export function openDb() {
  if (db) return db;
  db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  console.log(`[db] opened at path ${DB_PATH}`);
  return db;
}
export function getDb() {
  if (!db) throw new Error("[db] not open");
  return db;
}
export function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log("[db] closed");
  }
}
