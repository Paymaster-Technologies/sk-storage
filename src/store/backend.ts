// Storage backend interface. The pilot ships a local-disk implementation;
// an S3 or memo.top adapter plugs in here without touching the HTTP layer.

import type { Readable } from 'node:stream';

export interface ObjectInfo {
  path: string;
  size: number;
  /** Lower-hex sha256 of the content; doubles as the HTTP ETag. */
  etag: string;
  /** Unix ms of the last write on the server. */
  mtime: number;
}

/** A body that has been received and hashed but not yet made visible. */
export interface Staged {
  size: number;
  etag: string;
  /** Makes the object visible under `path`, replacing any previous content. */
  commit(path: string): Promise<ObjectInfo>;
  /** Discards the staged body. Safe to call after commit (no-op). */
  abort(): Promise<void>;
}

export interface Backend {
  list(storageId: string): Promise<ObjectInfo[]>;
  stat(storageId: string, path: string): Promise<ObjectInfo | null>;
  /** Byte sum of all objects of the storage-id. */
  usage(storageId: string): Promise<number>;
  open(storageId: string, path: string): Promise<Readable>;
  /**
   * Streams `body` into temporary storage, computing size and sha256. Rejects
   * with `TooLargeError` once more than `maxBytes` have been read.
   */
  stage(storageId: string, body: Readable, maxBytes: number): Promise<Staged>;
  delete(storageId: string, path: string): Promise<boolean>;
  deleteAll(storageId: string): Promise<void>;
}

export class TooLargeError extends Error {
  constructor(readonly limit: number) {
    super(`object exceeds ${limit} bytes`);
  }
}
