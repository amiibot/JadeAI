export interface DatabaseAdapter<TDb> {
  db: TDb;
  initialize(): Promise<void>;
  close(): Promise<void>;
}
