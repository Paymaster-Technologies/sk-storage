import { describe, expect, it } from 'vitest';

import { Authenticator, EMPTY_BODY_SHA256, decodeStorageId, encodeStorageId, signingString } from '../src/auth.js';
import { signHeaders, storageKeyFromSeed } from '../src/client.js';
import { parseObjectPath } from '../src/paths.js';

const seed = new Uint8Array(64).map((_, i) => i);
const key = storageKeyFromSeed(seed);

const lower = (h: Record<string, string>) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));

describe('storage id', () => {
  it('round-trips and uses HRP sks', () => {
    expect(key.storageId.startsWith('sks1')).toBe(true);
    expect(decodeStorageId(key.storageId)).toEqual(key.publicKey);
    expect(encodeStorageId(key.publicKey)).toBe(key.storageId);
  });
  it('rejects other HRPs and lengths', () => {
    expect(decodeStorageId(key.storageId.replace(/^sks1/, 'sk1'))).toBeNull();
    expect(decodeStorageId('sks1qqqq')).toBeNull();
    expect(decodeStorageId('')).toBeNull();
  });
  it('is deterministic for a seed', () => {
    expect(storageKeyFromSeed(seed).storageId).toBe(key.storageId);
    expect(storageKeyFromSeed(new Uint8Array(64)).storageId).not.toBe(key.storageId);
  });
});

describe('signing string', () => {
  it('has the documented layout', () => {
    expect(signingString({ method: 'get', path: '/v1/list', time: 5, nonce: 'n', bodySha256Hex: 'h' })).toBe(
      'SKS1\nGET\n/v1/list\n5\nn\nh',
    );
    expect(EMPTY_BODY_SHA256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

describe('Authenticator', () => {
  const T = 1_760_000_000_000;
  const make = () => new Authenticator(300_000, () => T);
  const headers = (o: Partial<Parameters<typeof signHeaders>[1]> = {}) =>
    lower(signHeaders(key, { method: 'GET', path: '/v1/list', time: T, ...o }));

  it('accepts a correct request once', () => {
    const a = make();
    const h = headers();
    const r = a.begin(h);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pending.storageId).toBe(key.storageId);
    expect(a.finish(r.pending, 'GET', '/v1/list', EMPTY_BODY_SHA256)).toBeNull();
    // replay
    const again = a.begin(h);
    expect(again).toEqual({ ok: false, reason: 'replay' });
  });

  it('rejects wrong path, method or body hash', () => {
    const a = make();
    const r = a.begin(headers());
    if (!r.ok) throw new Error('begin failed');
    expect(a.finish(r.pending, 'GET', '/v1/usage', EMPTY_BODY_SHA256)).toBe('bad-signature');
    expect(a.finish(r.pending, 'DELETE', '/v1/list', EMPTY_BODY_SHA256)).toBe('bad-signature');
    expect(a.finish(r.pending, 'GET', '/v1/list', '00'.repeat(32))).toBe('bad-signature');
    // nonce was not burnt by failed attempts
    expect(a.finish(r.pending, 'GET', '/v1/list', EMPTY_BODY_SHA256)).toBeNull();
  });

  it('rejects clock skew and malformed headers', () => {
    const a = make();
    expect(a.begin(headers({ time: T + 300_001 }))).toEqual({ ok: false, reason: 'clock-skew' });
    expect(a.begin(headers({ time: T - 300_001 }))).toEqual({ ok: false, reason: 'clock-skew' });
    expect(a.begin({})).toEqual({ ok: false, reason: 'missing' });
    expect(a.begin({ ...headers(), 'x-sk-storage': 'sk1abc' })).toEqual({ ok: false, reason: 'bad-storage-id' });
    expect(a.begin({ ...headers(), 'x-sk-time': 'now' })).toEqual({ ok: false, reason: 'bad-time' });
    expect(a.begin({ ...headers(), 'x-sk-nonce': 'short' })).toEqual({ ok: false, reason: 'bad-nonce' });
    expect(a.begin({ ...headers(), 'x-sk-sig': 'AAAA' })).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('rejects a signature from another key', () => {
    const a = make();
    const other = storageKeyFromSeed(new Uint8Array(64).fill(7));
    const h = { ...headers(), 'x-sk-storage': other.storageId };
    const r = a.begin(h);
    if (!r.ok) throw new Error('begin failed');
    expect(a.finish(r.pending, 'GET', '/v1/list', EMPTY_BODY_SHA256)).toBe('bad-signature');
  });
});

describe('object paths', () => {
  it('accepts archive-shaped paths', () => {
    expect(parseObjectPath('meta.sk1e')).toBe('meta.sk1e');
    expect(parseObjectPath('.storage/records.sk1e')).toBe('.storage/records.sk1e');
    expect(parseObjectPath('sk1qqqq/messages.ndjson')).toBe('sk1qqqq/messages.ndjson');
    expect(parseObjectPath('.storage%2Ffiles%2Fabc.skf')).toBe('.storage/files/abc.skf');
  });
  it('rejects traversal and odd characters', () => {
    for (const bad of ['', '/', 'a//b', '../x', 'a/../b', '.', 'a/.', 'a b', 'a%00b', 'ä', 'a/' + 'b'.repeat(256), 'a/b/c/d/e/f/g/h/i']) {
      expect(parseObjectPath(bad), bad).toBeNull();
    }
  });
});
