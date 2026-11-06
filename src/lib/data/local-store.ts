import fs from "node:fs";
import path from "node:path";
import { tableSchemas, VENUE_CHILD_TABLES, type Row, type TableName } from "./schema";
import { StoreError, type Store } from "./store";
import { buildSeed } from "../seed";

type Db = { [K in TableName]: Row<K>[] };

const UNIQUE: Partial<Record<TableName, string[]>> = {
  destinations: ["slug"],
  venues: ["slug"],
  articles: ["slug"],
  videos: ["slug"],
  guides: ["slug"],
  guide_purchases: ["payment_reference", "download_token_hash"],
  subscribers: ["email"],
};

/**
 * JSON-file store for local development, demos and tests.
 * Not for production: serverless filesystems are read-only/ephemeral.
 * If the file can't be written, the store degrades to a read-only seed snapshot.
 */
export class LocalStore implements Store {
  readonly kind = "local" as const;
  writable = true;
  private db: Db | null = null;
  private mtime = 0;

  constructor(private readonly file: string) {}

  private load(): Db {
    try {
      const stat = fs.statSync(this.file);
      if (this.db && stat.mtimeMs === this.mtime) return this.db;
      this.db = JSON.parse(fs.readFileSync(this.file, "utf8")) as Db;
      this.mtime = stat.mtimeMs;
      for (const t of Object.keys(tableSchemas) as TableName[]) this.db[t] ??= [] as never;
      return this.db;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      const seed = buildSeed() as Db;
      try {
        this.persist(seed);
      } catch {
        this.writable = false; // read-only filesystem (e.g. serverless demo)
      }
      this.db = seed;
      return seed;
    }
  }

  private persist(db: Db) {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
    fs.renameSync(tmp, this.file);
    this.mtime = fs.statSync(this.file).mtimeMs;
    this.db = db;
  }

  private write(mutate: (db: Db) => void) {
    if (!this.writable) throw new StoreError("This deployment is running on read-only demo data. Configure DATABASE_URL to enable editing.", "read_only");
    const db = structuredClone(this.load());
    mutate(db);
    try {
      this.persist(db);
    } catch {
      this.writable = false;
      throw new StoreError("Storage is read-only. Configure DATABASE_URL to enable editing.", "read_only");
    }
  }

  private checkUnique<T extends TableName>(db: Db, table: T, row: Row<T>) {
    for (const field of UNIQUE[table] ?? []) {
      const value = (row as Record<string, unknown>)[field];
      if (value == null) continue;
      const clash = (db[table] as Record<string, unknown>[]).find((r) => r[field] === value && r.id !== row.id);
      if (clash) throw new StoreError(`Another ${table.replace(/_/g, " ")} record already uses this ${field}.`, "conflict");
    }
  }

  async all<T extends TableName>(table: T) {
    return structuredClone(this.load()[table]) as Row<T>[];
  }
  async get<T extends TableName>(table: T, id: string) {
    const row = (this.load()[table] as Row<T>[]).find((r) => r.id === id);
    return row ? structuredClone(row) : null;
  }
  async findOne<T extends TableName>(table: T, field: keyof Row<T> & string, value: unknown) {
    const row = (this.load()[table] as Row<T>[]).find((r) => (r as Record<string, unknown>)[field] === value);
    return row ? structuredClone(row) : null;
  }
  async insert<T extends TableName>(table: T, row: Row<T>) {
    this.write((db) => {
      if ((db[table] as Row<T>[]).some((r) => r.id === row.id)) throw new StoreError("Duplicate id", "conflict");
      this.checkUnique(db, table, row);
      (db[table] as Row<T>[]).push(row);
    });
    return row;
  }
  async update<T extends TableName>(table: T, id: string, row: Row<T>) {
    this.write((db) => {
      const list = db[table] as Row<T>[];
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) throw new StoreError("Record not found", "not_found");
      this.checkUnique(db, table, row);
      list[i] = row;
    });
    return row;
  }
  async remove(table: TableName, id: string) {
    this.write((db) => {
      (db[table] as { id: string }[]) = (db[table] as { id: string }[]).filter((r) => r.id !== id);
      if (table === "venues") {
        for (const child of VENUE_CHILD_TABLES) (db[child] as { venue_id: string }[]) = (db[child] as { venue_id: string }[]).filter((r) => r.venue_id !== id);
        for (const t of ["articles", "videos"] as const) for (const r of db[t]) if (r.related_venue_id === id) r.related_venue_id = null;
      }
      if (table === "destinations") {
        for (const v of db.venues) if (v.destination_id === id) v.destination_id = null;
        for (const t of ["articles", "guides"] as const) for (const r of db[t]) if (r.related_destination_id === id) r.related_destination_id = null;
      }
      if (table === "articles") for (const v of db.videos) if (v.related_article_id === id) v.related_article_id = null;
      if (table === "guides") db.guide_purchases = db.guide_purchases.filter((p) => p.guide_id !== id);
    });
  }
}
