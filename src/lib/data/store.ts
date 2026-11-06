import type { Row, TableName } from "./schema";

/**
 * Minimal persistence contract. Content volume for v1 is small (hundreds of rows),
 * so filtering happens in the query layer; stores only need table-level CRUD.
 */
export interface Store {
  readonly kind: "postgres" | "local";
  readonly writable: boolean;
  all<T extends TableName>(table: T): Promise<Row<T>[]>;
  get<T extends TableName>(table: T, id: string): Promise<Row<T> | null>;
  findOne<T extends TableName>(table: T, field: keyof Row<T> & string, value: unknown): Promise<Row<T> | null>;
  insert<T extends TableName>(table: T, row: Row<T>): Promise<Row<T>>;
  update<T extends TableName>(table: T, id: string, row: Row<T>): Promise<Row<T>>;
  remove(table: TableName, id: string): Promise<void>;
}

export class StoreError extends Error {
  constructor(message: string, readonly code: "read_only" | "conflict" | "not_found" | "invalid") {
    super(message);
  }
}
