// Local-disk backend.
//
//   DATA_DIR/<storage-id>/o/<path>      object bodies
//   DATA_DIR/<storage-id>/tmp/<random>  staged uploads
//   DATA_DIR/<storage-id>/index.json    {path: {size, etag, mtime}}
//
// Bodies land in tmp and are renamed into place, so a crash mid-upload never
// leaves a half-written object. The index is rewritten atomically after each
// change; if it is lost it is rebuilt from the bodies on next access.

import { createHash, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

import { type Backend, type ObjectInfo, type Staged, TooLargeError } from './backend.js';

type Index = Record<string, { size: number; etag: string; mtime: number }>;

export class DiskBackend implements Backend {
  private readonly locks = new Map<string, Promise<unknown>>();
  private readonly indexes = new Map<string, Index>();

  constructor(private readonly root: string) {}

  async list(sid: string): Promise<ObjectInfo[]> {
    return this.locked(sid, async () => {
      const idx = await this.index(sid);
      return Object.entries(idx)
        .map(([path, m]) => ({ path, ...m }))
        .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    });
  }

  async stat(sid: string, path: string): Promise<ObjectInfo | null> {
    return this.locked(sid, async () => {
      const m = (await this.index(sid))[path];
      return m ? { path, ...m } : null;
    });
  }

  async usage(sid: string): Promise<number> {
    return this.locked(sid, async () => {
      let n = 0;
      for (const m of Object.values(await this.index(sid))) n += m.size;
      return n;
    });
  }

  async open(sid: string, path: string): Promise<Readable> {
    return createReadStream(this.objectFile(sid, path));
  }

  async stage(sid: string, body: Readable, maxBytes: number): Promise<Staged> {
    const tmpDir = join(this.sidDir(sid), 'tmp');
    await mkdir(tmpDir, { recursive: true });
    const tmp = join(tmpDir, randomBytes(12).toString('hex'));
    const hash = createHash('sha256');
    let size = 0;
    const meter = new Transform({
      transform(chunk: Buffer, _enc, cb) {
        size += chunk.length;
        if (size > maxBytes) {
          cb(new TooLargeError(maxBytes));
          return;
        }
        hash.update(chunk);
        cb(null, chunk);
      },
    });
    try {
      await pipeline(body, meter, createWriteStream(tmp));
    } catch (e) {
      await rm(tmp, { force: true });
      throw e;
    }
    const etag = hash.digest('hex');
    let done = false;
    return {
      size,
      etag,
      commit: async (path: string) => {
        done = true;
        return this.locked(sid, async () => {
          const file = this.objectFile(sid, path);
          await mkdir(dirname(file), { recursive: true });
          await rename(tmp, file);
          const idx = await this.index(sid);
          const mtime = Date.now();
          idx[path] = { size, etag, mtime };
          await this.saveIndex(sid, idx);
          return { path, size, etag, mtime };
        });
      },
      abort: async () => {
        if (done) return;
        done = true;
        await rm(tmp, { force: true });
      },
    };
  }

  async delete(sid: string, path: string): Promise<boolean> {
    return this.locked(sid, async () => {
      const idx = await this.index(sid);
      if (!idx[path]) return false;
      await rm(this.objectFile(sid, path), { force: true });
      delete idx[path];
      await this.saveIndex(sid, idx);
      await this.pruneEmptyDirs(sid, path);
      return true;
    });
  }

  async deleteAll(sid: string): Promise<void> {
    return this.locked(sid, async () => {
      this.indexes.delete(sid);
      await rm(this.sidDir(sid), { recursive: true, force: true });
    });
  }

  // -- internals ---------------------------------------------------------

  private sidDir(sid: string): string {
    return join(this.root, sid);
  }

  private objectFile(sid: string, path: string): string {
    return join(this.sidDir(sid), 'o', ...path.split('/'));
  }

  /** Serializes index mutations per storage-id. */
  private locked<T>(sid: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.locks.get(sid) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    this.locks.set(sid, next.catch(() => undefined));
    return next;
  }

  private async index(sid: string): Promise<Index> {
    const cached = this.indexes.get(sid);
    if (cached) return cached;
    let idx: Index;
    try {
      idx = JSON.parse(await readFile(join(this.sidDir(sid), 'index.json'), 'utf8')) as Index;
    } catch {
      idx = await this.rebuildIndex(sid);
    }
    this.indexes.set(sid, idx);
    return idx;
  }

  private async saveIndex(sid: string, idx: Index): Promise<void> {
    const dir = this.sidDir(sid);
    await mkdir(dir, { recursive: true });
    const tmp = join(dir, `index.${randomBytes(6).toString('hex')}.tmp`);
    await writeFile(tmp, JSON.stringify(idx));
    await rename(tmp, join(dir, 'index.json'));
    this.indexes.set(sid, idx);
  }

  private async rebuildIndex(sid: string): Promise<Index> {
    const idx: Index = {};
    const base = join(this.sidDir(sid), 'o');
    const walk = async (rel: string[]): Promise<void> => {
      let entries;
      try {
        entries = await readdir(join(base, ...rel), { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const next = [...rel, e.name];
        if (e.isDirectory()) await walk(next);
        else if (e.isFile()) {
          const file = join(base, ...next);
          const st = await stat(file);
          const hash = createHash('sha256');
          await pipeline(createReadStream(file), hash);
          idx[next.join('/')] = { size: st.size, etag: hash.digest('hex'), mtime: Math.round(st.mtimeMs) };
        }
      }
    };
    await walk([]);
    if (Object.keys(idx).length) await this.saveIndex(sid, idx);
    return idx;
  }

  private async pruneEmptyDirs(sid: string, path: string): Promise<void> {
    const parts = path.split('/');
    const base = join(this.sidDir(sid), 'o');
    for (let i = parts.length - 1; i > 0; i--) {
      const dir = join(base, ...parts.slice(0, i));
      try {
        if ((await readdir(dir)).length) return;
        await rm(dir, { recursive: false, force: true });
      } catch {
        return;
      }
    }
  }
}
