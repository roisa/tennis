import "server-only";
import path from "node:path";
import { LocalStore } from "./local-store";
import { PostgresStore } from "./postgres-store";
import type { Store } from "./store";

const globalForStore = globalThis as unknown as { __courtscapeStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__courtscapeStore) {
    const url = process.env.DATABASE_URL;
    globalForStore.__courtscapeStore = url
      ? new PostgresStore(url)
      : new LocalStore(process.env.LOCAL_DATA_FILE ?? path.join(process.cwd(), ".data", "courtscape.json"));
  }
  return globalForStore.__courtscapeStore;
}
