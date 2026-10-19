// HTTP layer: routes, authentication, quotas. No framework, node:http only.
//
//   GET    /                        landing page for humans (HTML, language by Accept-Language);
//                                   on hosts listed in landing.ts LOGO_HOSTS only that brand's logo
//   GET    /robots.txt, /.well-known/security.txt, /favicon.ico, /icon-32.png, /icon-128.png
//   GET    /healthz                 liveness, unauthenticated
//   GET    /v1/list                 [{path,size,etag,mtime}]
//   GET    /v1/usage                {used, quota, maxObject}
//   PUT    /v1/o/<path>             upload (If-Match / If-None-Match honoured)
//   GET    /v1/o/<path>             download (ETag, If-None-Match → 304)
//   HEAD   /v1/o/<path>             metadata only
//   DELETE /v1/o/<path>             remove one object (If-Match honoured)
//   DELETE /v1/all                  remove everything of the storage-id
//
// Errors are JSON: {"error": "<code>", "message": "<text>"}. With
// MAX_STORAGE_IDS set, a new storage-id on a full host gets 403 ids-limit.

import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { pipeline } from 'node:stream/promises';

import { type AuthFailure, type AuthPending, Authenticator, EMPTY_BODY_SHA256 } from './auth.js';
import type { Config } from './config.js';
import { ICON_128_PNG, ICON_32_PNG } from './icons.js';
import { landingHtml, logoPageHtml, pickLanguage, ROBOTS_TXT, securityTxt } from './landing.js';
import { parseObjectPath } from './paths.js';
import { type Backend, TooLargeError } from './store/backend.js';

export interface AppOptions {
  config: Config;
  backend: Backend;
  now?: () => number;
  log?: (line: string) => void;
}

export type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const AUTH_STATUS: Record<AuthFailure, string> = {
  missing: 'X-SK-Storage, X-SK-Time, X-SK-Nonce and X-SK-Sig headers are required',
  'bad-storage-id': 'X-SK-Storage is not a bech32 storage-id with HRP "sks"',
  'bad-time': 'X-SK-Time must be unix milliseconds',
  'clock-skew': 'X-SK-Time is too far from server time',
  'bad-nonce': 'X-SK-Nonce must be 16..128 characters of [A-Za-z0-9_=-]',
  replay: 'nonce already used',
  'bad-signature': 'signature does not verify',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-Match, If-None-Match, X-SK-Storage, X-SK-Time, X-SK-Nonce, X-SK-Sig',
  'Access-Control-Expose-Headers': 'ETag, Content-Length, Last-Modified, X-SK-Server-Time',
  'Access-Control-Max-Age': '600',
};

/**
 * Scheme + host the client used, for the "paste this address" block of the
 * landing page. Behind the reverse proxy the scheme comes from
 * X-Forwarded-Proto; the page itself prefers location.origin once scripts run.
 */
export function requestOrigin(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  const scheme = proto === 'http' || proto === 'https' ? proto : 'encrypted' in req.socket && req.socket.encrypted ? 'https' : 'http';
  const host = req.headers.host ?? 'localhost';
  return `${scheme}://${host}`;
}

export function createApp(opts: AppOptions): Handler {
  const { config, backend } = opts;
  const now = opts.now ?? Date.now;
  const log = opts.log ?? (() => undefined);
  const auth = new Authenticator(config.skewMs, now);

  const json = (res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) => {
    const text = JSON.stringify(body);
    res.writeHead(status, {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(text),
      'X-SK-Server-Time': String(now()),
      'Cache-Control': 'no-store',
      ...extra,
    });
    res.end(text);
  };
  const fail = (res: ServerResponse, e: HttpError) => json(res, e.status, { error: e.code, message: e.message });
  // Static, cacheable documents (landing page, robots.txt, security.txt).
  const text = (res: ServerResponse, method: string, body: string | Buffer, contentType: string, extra: Record<string, string> = {}) => {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...extra,
    });
    res.end(method === 'HEAD' ? undefined : body);
  };
  const ICONS: Record<string, Buffer> = {
    '/favicon.ico': ICON_32_PNG,
    '/icon-32.png': ICON_32_PNG,
    '/icon-128.png': ICON_128_PNG,
  };
  const authFail = (reason: AuthFailure) => new HttpError(401, `auth-${reason}`, AUTH_STATUS[reason]);

  const headerMap = (req: IncomingMessage): Record<string, string | undefined> => {
    const out: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(req.headers)) out[k] = Array.isArray(v) ? v[0] : v;
    return out;
  };

  const begin = (req: IncomingMessage): AuthPending => {
    const r = auth.begin(headerMap(req));
    if (!r.ok) throw authFail(r.reason);
    return r.pending;
  };

  /**
   * MAX_STORAGE_IDS: an id that already holds data is always admitted; a new
   * one only while there is a free slot. Checked on every authenticated
   * route so the app learns about a full host on its first `list`, not
   * after a failed upload.
   */
  const admit = async (storageId: string) => {
    if (!config.maxStorageIds) return;
    if (await backend.exists(storageId)) return;
    if ((await backend.count()) >= config.maxStorageIds) {
      throw new HttpError(403, 'ids-limit', `this host accepts no new storage-ids (MAX_STORAGE_IDS=${config.maxStorageIds})`);
    }
  };

  /** Reads and hashes a body that is expected to be empty or small (JSON-less endpoints). */
  const finishNoBody = async (req: IncomingMessage, pending: AuthPending, method: string, path: string) => {
    const hash = createHash('sha256');
    let size = 0;
    for await (const chunk of req) {
      size += (chunk as Buffer).length;
      if (size > 4096) throw new HttpError(400, 'unexpected-body', 'this endpoint takes no request body');
      hash.update(chunk as Buffer);
    }
    const reason = auth.finish(pending, method, path, size ? hash.digest('hex') : EMPTY_BODY_SHA256);
    if (reason) throw authFail(reason);
  };

  const objectHeaders = (info: { size: number; etag: string; mtime: number }) => ({
    ...CORS,
    'Content-Type': 'application/octet-stream',
    'Content-Length': String(info.size),
    ETag: `"${info.etag}"`,
    'Last-Modified': new Date(info.mtime).toUTCString(),
    'X-SK-Server-Time': String(now()),
    'Cache-Control': 'no-store',
  });

  const stripQuotes = (v: string | undefined) => (v === undefined ? undefined : v.trim().replace(/^W\//, '').replace(/^"(.*)"$/, '$1'));

  /** Applies If-Match / If-None-Match against the current etag (undefined when absent). */
  const checkPreconditions = (req: IncomingMessage, current: string | undefined) => {
    const ifMatch = stripQuotes(headerMap(req)['if-match']);
    const ifNoneMatch = stripQuotes(headerMap(req)['if-none-match']);
    if (ifMatch !== undefined) {
      if (ifMatch === '*' ? current === undefined : ifMatch !== current) {
        throw new HttpError(412, 'precondition-failed', 'If-Match does not match the current object');
      }
    }
    if (ifNoneMatch !== undefined) {
      if (ifNoneMatch === '*' ? current !== undefined : ifNoneMatch === current) {
        throw new HttpError(412, 'precondition-failed', 'If-None-Match matches the current object');
      }
    }
  };

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const method = (req.method ?? 'GET').toUpperCase();
    const rawUrl = req.url ?? '/';
    const url = new URL(rawUrl, 'http://sk');
    const signedPath = url.pathname + url.search;

    if (method === 'OPTIONS') {
      res.writeHead(204, CORS);
      res.end();
      return;
    }
    if (url.pathname === '/healthz' && (method === 'GET' || method === 'HEAD')) {
      json(res, 200, { ok: true, time: now() });
      return;
    }
    if (method === 'GET' || method === 'HEAD') {
      // Pages for people and crawlers; everything else stays JSON for API clients.
      if (url.pathname === '/') {
        const logoPage = logoPageHtml(req.headers.host);
        if (logoPage) {
          text(res, method, logoPage, 'text/html; charset=utf-8');
          return;
        }
        const lang = pickLanguage(req.headers['accept-language']);
        text(res, method, landingHtml(lang, requestOrigin(req)), 'text/html; charset=utf-8', { Vary: 'Accept-Language', 'Content-Language': lang });
        return;
      }
      const icon = ICONS[url.pathname];
      if (icon) {
        text(res, method, icon, 'image/png', { 'Cache-Control': 'public, max-age=86400' });
        return;
      }
      if (url.pathname === '/robots.txt') {
        text(res, method, ROBOTS_TXT, 'text/plain; charset=utf-8');
        return;
      }
      if (url.pathname === '/.well-known/security.txt') {
        text(res, method, securityTxt(now()), 'text/plain; charset=utf-8');
        return;
      }
    }

    if (url.pathname === '/v1/list' && method === 'GET') {
      const p = begin(req);
      await finishNoBody(req, p, method, signedPath);
      await admit(p.storageId);
      json(res, 200, await backend.list(p.storageId));
      return;
    }
    if (url.pathname === '/v1/usage' && method === 'GET') {
      const p = begin(req);
      await finishNoBody(req, p, method, signedPath);
      await admit(p.storageId);
      json(res, 200, { used: await backend.usage(p.storageId), quota: config.quotaBytes, maxObject: config.maxObjectBytes });
      return;
    }
    if (url.pathname === '/v1/all' && method === 'DELETE') {
      const p = begin(req);
      await finishNoBody(req, p, method, signedPath);
      await backend.deleteAll(p.storageId);
      log(`deleteAll ${p.storageId.slice(0, 12)}…`);
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname.startsWith('/v1/o/')) {
      const path = parseObjectPath(url.pathname.slice('/v1/o/'.length));
      if (!path) throw new HttpError(400, 'bad-path', 'object path must be 1..8 segments of [A-Za-z0-9._-], no "." or ".."');
      const p = begin(req);

      if (method === 'GET' || method === 'HEAD') {
        await finishNoBody(req, p, method, signedPath);
        await admit(p.storageId);
        const info = await backend.stat(p.storageId, path);
        if (!info) throw new HttpError(404, 'not-found', 'no such object');
        if (stripQuotes(headerMap(req)['if-none-match']) === info.etag) {
          res.writeHead(304, { ...CORS, ETag: `"${info.etag}"`, 'X-SK-Server-Time': String(now()) });
          res.end();
          return;
        }
        res.writeHead(200, objectHeaders(info));
        if (method === 'HEAD') {
          res.end();
          return;
        }
        await pipeline(await backend.open(p.storageId, path), res);
        return;
      }

      if (method === 'DELETE') {
        await finishNoBody(req, p, method, signedPath);
        await admit(p.storageId);
        const info = await backend.stat(p.storageId, path);
        checkPreconditions(req, info?.etag);
        const removed = await backend.delete(p.storageId, path);
        json(res, removed ? 200 : 404, removed ? { ok: true } : { error: 'not-found', message: 'no such object' });
        return;
      }

      if (method === 'PUT') {
        const declared = Number(req.headers['content-length'] ?? NaN);
        if (Number.isFinite(declared) && declared > config.maxObjectBytes) {
          throw new HttpError(413, 'too-large', `object exceeds MAX_OBJECT_BYTES (${config.maxObjectBytes})`);
        }
        // The signature covers the body hash and is verified after staging,
        // so the slot check runs on the claimed id here: a full host answers
        // before the body is read, a forged id still ends in 401.
        await admit(p.storageId);
        const before = await backend.stat(p.storageId, path);
        checkPreconditions(req, before?.etag);
        const used = await backend.usage(p.storageId);
        if (Number.isFinite(declared) && used - (before?.size ?? 0) + declared > config.quotaBytes) {
          throw new HttpError(413, 'quota', `storage quota exceeded (${config.quotaBytes} bytes)`);
        }
        let staged;
        try {
          staged = await backend.stage(p.storageId, req, config.maxObjectBytes);
        } catch (e) {
          if (e instanceof TooLargeError) throw new HttpError(413, 'too-large', `object exceeds MAX_OBJECT_BYTES (${e.limit})`);
          throw e;
        }
        try {
          const reason = auth.finish(p, method, signedPath, staged.etag);
          if (reason) throw authFail(reason);
          const used2 = await backend.usage(p.storageId);
          if (used2 - (before?.size ?? 0) + staged.size > config.quotaBytes) {
            throw new HttpError(413, 'quota', `storage quota exceeded (${config.quotaBytes} bytes)`);
          }
          // Re-check the precondition: another request may have landed while
          // the body was streaming.
          const current = await backend.stat(p.storageId, path);
          checkPreconditions(req, current?.etag);
          const info = await staged.commit(path);
          log(`put ${p.storageId.slice(0, 12)}… ${info.size}B`);
          json(res, before ? 200 : 201, { path: info.path, size: info.size, etag: info.etag, mtime: info.mtime }, { ETag: `"${info.etag}"` });
        } finally {
          await staged.abort();
        }
        return;
      }

      throw new HttpError(405, 'method-not-allowed', 'use PUT, GET, HEAD or DELETE');
    }

    throw new HttpError(404, 'not-found', 'unknown route');
  };

  return async (req, res) => {
    try {
      await handle(req, res);
    } catch (e) {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      if (e instanceof HttpError) {
        // Drain whatever the client is still sending so the connection can be reused.
        req.resume();
        fail(res, e);
        return;
      }
      log(`error ${req.method} ${req.url}: ${(e as Error).stack ?? e}`);
      req.resume();
      fail(res, new HttpError(500, 'internal', 'internal error'));
    }
  };
}
