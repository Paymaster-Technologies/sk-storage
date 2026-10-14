import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { objectUrlPath, signHeaders, storageKeyFromSeed, type StorageKey } from '../src/client.js';
import { DiskBackend } from '../src/store/disk.js';

const key = storageKeyFromSeed(new Uint8Array(64).fill(1));
const other = storageKeyFromSeed(new Uint8Array(64).fill(2));

let server: Server;
let base: string;
let dataDir: string;

beforeAll(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'sk-storage-'));
  const handler = createApp({
    config: { host: '127.0.0.1', port: 0, dataDir, quotaBytes: 1000, maxObjectBytes: 600, skewMs: 300_000 },
    backend: new DiskBackend(dataDir),
  });
  server = createServer((req, res) => void handler(req, res));
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  await rm(dataDir, { recursive: true, force: true });
});

async function call(
  k: StorageKey,
  method: string,
  path: string,
  body?: Uint8Array,
  extra: Record<string, string> = {},
  signOverride: Partial<{ method: string; path: string; body: Uint8Array }> = {},
): Promise<Response> {
  const headers = { ...signHeaders(k, { method, path, body, ...signOverride }), ...extra };
  return fetch(base + path, { method, headers, body: body ? Buffer.from(body) : undefined });
}

const bytes = (s: string) => new TextEncoder().encode(s);

describe('storage server', () => {
  it('answers healthz without auth', async () => {
    const r = await fetch(`${base}/healthz`);
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
  });

  it('requires auth on /v1', async () => {
    const r = await fetch(`${base}/v1/list`);
    expect(r.status).toBe(401);
    expect((await r.json()).error).toBe('auth-missing');
  });

  it('lists empty, puts, gets, heads, lists, deletes', async () => {
    expect(await (await call(key, 'GET', '/v1/list')).json()).toEqual([]);

    const p = objectUrlPath('.storage/records.sk1e');
    const put = await call(key, 'PUT', p, bytes('hello'));
    expect(put.status).toBe(201);
    const info = await put.json();
    expect(info.path).toBe('.storage/records.sk1e');
    expect(info.size).toBe(5);
    expect(info.etag).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    expect(put.headers.get('etag')).toBe(`"${info.etag}"`);

    const get = await call(key, 'GET', p);
    expect(get.status).toBe(200);
    expect(await get.text()).toBe('hello');
    expect(get.headers.get('etag')).toBe(`"${info.etag}"`);
    expect(get.headers.get('content-length')).toBe('5');

    const head = await call(key, 'HEAD', p);
    expect(head.status).toBe(200);
    expect(head.headers.get('content-length')).toBe('5');

    const notModified = await call(key, 'GET', p, undefined, { 'If-None-Match': `"${info.etag}"` });
    expect(notModified.status).toBe(304);

    const list = await (await call(key, 'GET', '/v1/list')).json();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ path: '.storage/records.sk1e', size: 5, etag: info.etag });

    const usage = await (await call(key, 'GET', '/v1/usage')).json();
    expect(usage).toEqual({ used: 5, quota: 1000, maxObject: 600 });

    // another identity sees nothing
    expect(await (await call(other, 'GET', '/v1/list')).json()).toEqual([]);
    expect((await call(other, 'GET', p)).status).toBe(404);

    // overwrite returns 200
    const put2 = await call(key, 'PUT', p, bytes('hello2'));
    expect(put2.status).toBe(200);
    expect(await (await call(key, 'GET', p)).text()).toBe('hello2');

    const del = await call(key, 'DELETE', p);
    expect(del.status).toBe(200);
    expect((await call(key, 'GET', p)).status).toBe(404);
    expect((await call(key, 'DELETE', p)).status).toBe(404);
    expect(await (await call(key, 'GET', '/v1/list')).json()).toEqual([]);
  });

  it('rejects a body that does not match the signed hash', async () => {
    const p = objectUrlPath('meta.sk1e');
    const r = await call(key, 'PUT', p, bytes('real body'), {}, { body: bytes('signed body') });
    expect(r.status).toBe(401);
    expect((await r.json()).error).toBe('auth-bad-signature');
    expect((await call(key, 'GET', p)).status).toBe(404);
    // staging left nothing behind
    const tmp = await readdir(join(dataDir, key.storageId, 'tmp')).catch(() => []);
    expect(tmp).toEqual([]);
  });

  it('rejects replays and signatures for another path', async () => {
    const h = signHeaders(key, { method: 'GET', path: '/v1/list' });
    expect((await fetch(`${base}/v1/list`, { headers: h })).status).toBe(200);
    const replay = await fetch(`${base}/v1/list`, { headers: h });
    expect(replay.status).toBe(401);
    expect((await replay.json()).error).toBe('auth-replay');

    const wrong = await fetch(`${base}/v1/usage`, { headers: signHeaders(key, { method: 'GET', path: '/v1/list' }) });
    expect(wrong.status).toBe(401);
  });

  it('rejects bad paths before auth work', async () => {
    const r = await call(key, 'PUT', '/v1/o/..%2Fetc%2Fpasswd', bytes('x'));
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('bad-path');
  });

  it('honours If-Match / If-None-Match on PUT and DELETE', async () => {
    const p = objectUrlPath('a/messages.ndjson');
    expect((await call(key, 'PUT', p, bytes('v1'), { 'If-Match': '"deadbeef"' })).status).toBe(412);
    expect((await call(key, 'PUT', p, bytes('v1'), { 'If-None-Match': '*' })).status).toBe(201);
    expect((await call(key, 'PUT', p, bytes('v2'), { 'If-None-Match': '*' })).status).toBe(412);
    const etag = (await (await call(key, 'HEAD', p)).headers.get('etag')) ?? '';
    expect((await call(key, 'PUT', p, bytes('v2'), { 'If-Match': etag })).status).toBe(200);
    expect((await call(key, 'DELETE', p, undefined, { 'If-Match': etag })).status).toBe(412);
    const etag2 = (await (await call(key, 'HEAD', p)).headers.get('etag')) ?? '';
    expect((await call(key, 'DELETE', p, undefined, { 'If-Match': etag2 })).status).toBe(200);
  });

  it('enforces max object size and quota', async () => {
    const big = await call(key, 'PUT', objectUrlPath('big'), new Uint8Array(601));
    expect(big.status).toBe(413);
    expect((await big.json()).error).toBe('too-large');

    expect((await call(key, 'PUT', objectUrlPath('q1'), new Uint8Array(500))).status).toBe(201);
    expect((await call(key, 'PUT', objectUrlPath('q2'), new Uint8Array(400))).status).toBe(201);
    const over = await call(key, 'PUT', objectUrlPath('q3'), new Uint8Array(200));
    expect(over.status).toBe(413);
    expect((await over.json()).error).toBe('quota');
    // replacing an object counts only the delta
    expect((await call(key, 'PUT', objectUrlPath('q1'), new Uint8Array(550))).status).toBe(200);
    expect((await (await call(key, 'GET', '/v1/usage')).json()).used).toBe(950);
  });

  it('deletes everything with DELETE /v1/all', async () => {
    expect((await call(key, 'GET', '/v1/list').then((r) => r.json())).length).toBeGreaterThan(0);
    expect((await call(key, 'DELETE', '/v1/all')).status).toBe(200);
    expect(await (await call(key, 'GET', '/v1/list')).json()).toEqual([]);
    expect((await (await call(key, 'GET', '/v1/usage')).json()).used).toBe(0);
  });

  it('rebuilds the index from bodies when index.json is missing', async () => {
    const p = objectUrlPath('x/y.bin');
    expect((await call(key, 'PUT', p, bytes('rebuild me'))).status).toBe(201);
    await rm(join(dataDir, key.storageId, 'index.json'));
    const fresh = new DiskBackend(dataDir);
    const list = await fresh.list(key.storageId);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ path: 'x/y.bin', size: 10 });
  });

  it('answers CORS preflight', async () => {
    const r = await fetch(`${base}/v1/list`, { method: 'OPTIONS' });
    expect(r.status).toBe(204);
    expect(r.headers.get('access-control-allow-headers')).toContain('X-SK-Sig');
  });
});
