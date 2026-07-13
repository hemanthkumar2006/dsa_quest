import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { pool } from "./db";

async function migrate() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Migration applied.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
