/**
 * Rebuilds a LOCAL Postgres database: shim → migrations → seed.
 * Refuses to run against non-local hosts. Usage: DATABASE_URL=postgres://… npx tsx scripts/db-reset-local.ts
 */
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1"].includes(host)) throw new Error(`Refusing to reset non-local database host "${host}"`);

const sql = postgres(url, { max: 1, onnotice: () => {} });
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const migrations = fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort();

await sql.unsafe("drop schema if exists public cascade; create schema public;");
await sql.unsafe(read("supabase/local-shim.sql"));
for (const m of migrations) await sql.unsafe(read(`supabase/migrations/${m}`));
await sql.unsafe(read("supabase/seed.sql"));
const [{ n }] = await sql`select count(*)::int as n from venues`;
console.log(`Local database reset: ${migrations.length} migration(s), ${n} venues seeded.`);
await sql.end();
