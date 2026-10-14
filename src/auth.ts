// Request authentication, protocol SKS1.
//
// The client owns an Ed25519 key derived from its seed phrase
// (HKDF-SHA256, info "secret-keeper/storage-ed25519/v1"). Its storage-id is
// the bech32 form of the public key with HRP `sks`. Every request carries:
//
//   X-SK-Storage: sks1...                 storage-id (public key)
//   X-SK-Time:    1760000000000           client clock, unix ms
//   X-SK-Nonce:   16+ random bytes, base64url or hex, unique per request
//   X-SK-Sig:     base64(Ed25519 signature over the signing string)
//
// Signing string (UTF-8, "\n" separated, no trailing newline):
//
//   SKS1
//   {METHOD}                 upper case
//   {path}                   request path including query, as sent
//   {time}
//   {nonce}
//   {sha256(body) lower hex} sha256 of the empty string for bodiless requests
//
// The server rejects requests whose time is outside +-skewMs of its clock and
// remembers nonces for that window so a captured request cannot be replayed.

import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';
import { base64, bech32 } from '@scure/base';

export const STORAGE_HRP = 'sks';
export const SIGNING_PREFIX = 'SKS1';
export const EMPTY_BODY_SHA256 = bytesToHex(sha256(new Uint8Array(0)));

export const HEADER_STORAGE = 'x-sk-storage';
export const HEADER_TIME = 'x-sk-time';
export const HEADER_NONCE = 'x-sk-nonce';
export const HEADER_SIG = 'x-sk-sig';

export function encodeStorageId(publicKey: Uint8Array): string {
  if (publicKey.length !== 32) throw new Error('Ed25519 public key must be 32 bytes');
  return bech32.encode(STORAGE_HRP, bech32.toWords(publicKey), 90);
}

/** Returns the 32-byte public key or null when the id is malformed. */
export function decodeStorageId(id: string): Uint8Array | null {
  try {
    const { prefix, words } = bech32.decode(id as `${string}1${string}`, 90);
    if (prefix !== STORAGE_HRP) return null;
    const key = bech32.fromWords(words);
    return key.length === 32 ? key : null;
  } catch {
    return null;
  }
}

export interface SignedRequest {
  method: string;
  /** Path with query, exactly as it appears in the request line. */
  path: string;
  time: number;
  nonce: string;
  bodySha256Hex: string;
}

export function signingString(r: SignedRequest): string {
  return [SIGNING_PREFIX, r.method.toUpperCase(), r.path, String(r.time), r.nonce, r.bodySha256Hex].join('\n');
}

export function sign(privateKey: Uint8Array, r: SignedRequest): string {
  const sig = ed25519.sign(new TextEncoder().encode(signingString(r)), privateKey);
  return base64.encode(sig);
}

export type AuthFailure =
  | 'missing'
  | 'bad-storage-id'
  | 'bad-time'
  | 'clock-skew'
  | 'bad-nonce'
  | 'replay'
  | 'bad-signature';

export interface AuthPending {
  storageId: string;
  publicKey: Uint8Array;
  time: number;
  nonce: string;
  signature: Uint8Array;
}

const NONCE_RE = /^[A-Za-z0-9_=-]{16,128}$/;

export class Authenticator {
  private readonly nonces = new Map<string, number>();
  private lastSweep = 0;

  constructor(
    private readonly skewMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /**
   * Validates headers and the time window. Does not verify the signature yet:
   * for uploads the body hash is only known once the body has been stored.
   */
  begin(headers: Record<string, string | undefined>): { ok: true; pending: AuthPending } | { ok: false; reason: AuthFailure } {
    const storageId = headers[HEADER_STORAGE];
    const timeRaw = headers[HEADER_TIME];
    const nonce = headers[HEADER_NONCE];
    const sigRaw = headers[HEADER_SIG];
    if (!storageId || !timeRaw || !nonce || !sigRaw) return { ok: false, reason: 'missing' };
    const publicKey = decodeStorageId(storageId);
    if (!publicKey) return { ok: false, reason: 'bad-storage-id' };
    if (!/^\d{1,16}$/.test(timeRaw)) return { ok: false, reason: 'bad-time' };
    const time = Number(timeRaw);
    if (Math.abs(this.now() - time) > this.skewMs) return { ok: false, reason: 'clock-skew' };
    if (!NONCE_RE.test(nonce)) return { ok: false, reason: 'bad-nonce' };
    let signature: Uint8Array;
    try {
      signature = base64.decode(sigRaw);
    } catch {
      return { ok: false, reason: 'bad-signature' };
    }
    if (signature.length !== 64) return { ok: false, reason: 'bad-signature' };
    if (this.nonces.has(this.nonceKey(storageId, nonce))) return { ok: false, reason: 'replay' };
    return { ok: true, pending: { storageId, publicKey, time, nonce, signature } };
  }

  /** Verifies the signature and burns the nonce. */
  finish(pending: AuthPending, method: string, path: string, bodySha256Hex: string): AuthFailure | null {
    const msg = new TextEncoder().encode(
      signingString({ method, path, time: pending.time, nonce: pending.nonce, bodySha256Hex }),
    );
    let valid = false;
    try {
      valid = ed25519.verify(pending.signature, msg, pending.publicKey);
    } catch {
      valid = false;
    }
    if (!valid) return 'bad-signature';
    const key = this.nonceKey(pending.storageId, pending.nonce);
    if (this.nonces.has(key)) return 'replay';
    this.nonces.set(key, this.now() + this.skewMs * 2);
    this.sweep();
    return null;
  }

  private nonceKey(storageId: string, nonce: string): string {
    return `${storageId}\n${nonce}`;
  }

  private sweep(): void {
    const t = this.now();
    if (t - this.lastSweep < 30_000 && this.nonces.size < 100_000) return;
    this.lastSweep = t;
    for (const [k, exp] of this.nonces) if (exp <= t) this.nonces.delete(k);
  }
}
