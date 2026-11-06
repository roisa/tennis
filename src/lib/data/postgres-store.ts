import postgres from "postgres";
import { tableSchemas, type Row, type TableName } from "./schema";
import { StoreError, type Store } from "./store";

const NUMERIC_FIELDS = new Set([
  "latitude", "longitude", "rental_price", "price", "amount",
  "scenery_score", "tennis_quality_score", "stay_experience_score", "accessibility_score", "family_experience_score", "overall_score",
]);
const GENERATED = new Set(["overall_score"]);
const TABLES = new Set(Object.keys(tableSchemas));

function columnsOf(table: TableName): string[] {
  return Object.keys(tableSchemas[table].shape);
}

function normalize<T extends TableName>(table: T, raw: Record<string, unknown>): Row<T> {
  const out: Record<string, unknown> = {};
  for (const col of columnsOf(table)) {
    let v = raw[col];
    if (v instanceof Date) v = v.toISOString(); // timestamptz; `date` columns are parsed as plain strings
    if (v != null && NUMERIC_FIELDS.has(col)) v = Number(v);
    out[col] = v === undefined ? null : v;
  }
  return out as Row<T>;
}

/**
 * Postgres store — works with Supabase Postgres (use the pooled connection string,
 * transaction mode, port 6543) or any Postgres 14+. The app connects with a server-only
 * credential; Row Level Security in the migration additionally protects the public API.
 */
export class PostgresStore implements Store {
  readonly kind = "postgres" as const;
  readonly writable = true;
  private sql: postgres.Sql;

  constructor(url: string) {
    this.sql = postgres(url, {
      prepare: false,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idle_timeout: 20,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
      types: { date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x } },
    });
  }

  private t(table: TableName) {
    if (!TABLES.has(table)) throw new StoreError("Unknown table", "invalid");
    return this.sql(table);
  }

  private wrap(err: unknown): never {
    const e = err as { code?: string; detail?: string; message?: string };
    if (e.code === "23505") throw new StoreError(`Duplicate value: ${e.detail ?? "a unique field is already in use"}`, "conflict");
    if (e.code === "23503") throw new StoreError("A related record is missing or still referenced.", "conflict");
    throw err;
  }

  async all<T extends TableName>(table: T) {
    const rows = await this.sql`select * from ${this.t(table)} order by created_at asc`;
    return rows.map((r) => normalize(table, r));
  }
  async get<T extends TableName>(table: T, id: string) {
    const [row] = await this.sql`select * from ${this.t(table)} where id = ${id}`;
    return row ? normalize(table, row) : null;
  }
  async findOne<T extends TableName>(table: T, field: keyof Row<T> & string, value: unknown) {
    if (!columnsOf(table).includes(field)) throw new StoreError("Unknown column", "invalid");
    const [row] = await this.sql`select * from ${this.t(table)} where ${this.sql(field)} = ${value as string} limit 1`;
    return row ? normalize(table, row) : null;
  }
  async insert<T extends TableName>(table: T, row: Row<T>) {
    const data = Object.fromEntries(Object.entries(row).filter(([k]) => !GENERATED.has(k)));
    try {
      const [out] = await this.sql`insert into ${this.t(table)} ${this.sql(data as Record<string, postgres.ParameterOrJSON<never>>)} returning *`;
      return normalize(table, out);
    } catch (e) {
      this.wrap(e);
    }
  }
  async update<T extends TableName>(table: T, id: string, row: Row<T>) {
    const data = Object.fromEntries(Object.entries(row).filter(([k]) => !GENERATED.has(k) && k !== "id" && k !== "created_at"));
    try {
      const [out] = await this.sql`update ${this.t(table)} set ${this.sql(data as Record<string, postgres.ParameterOrJSON<never>>)} where id = ${id} returning *`;
      if (!out) throw new StoreError("Record not found", "not_found");
      return normalize(table, out);
    } catch (e) {
      if (e instanceof StoreError) throw e;
      this.wrap(e);
    }
  }
  async remove(table: TableName, id: string) {
    try {
      await this.sql`delete from ${this.t(table)} where id = ${id}`;
    } catch (e) {
      this.wrap(e);
    }
  }
  async end() {
    await this.sql.end();
  }
}
