// Reference client pieces: key derivation from the Secret Keeper seed and
// request signing. Used by the tests and `npm run sign`; the app and the
// browser extension carry their own ports of exactly this.

import { ed25519 } from '@noble/curves/ed25519';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { base64urlnopad } from '@scure/base';

import { encodeStorageId, sign } from './auth.js';
import { encodeObjectPath } from './paths.js';

export const HKDF_STORAGE_INFO = 'secret-keeper/storage-ed25519/v1';

export interface StorageKey {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  storageId: string;
}

/** `seed` is the 64-byte BIP-39 seed the identity keys are derived from. */
export function storageKeyFromSeed(seed: Uint8Array): StorageKey {
  const privateKey = hkdf(sha256, seed, undefined, new TextEncoder().encode(HKDF_STORAGE_INFO), 32);
  const publicKey = ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey, storageId: encodeStorageId(publicKey) };
}

export function newNonce(): string {
  return base64urlnopad.encode(randomBytes(16));
}

export interface SignOptions {
  method: string;
  /** Path with query as it will be sent, e.g. `/v1/o/meta.sk1e`. */
  path: string;
  body?: Uint8Array;
  time?: number;
  nonce?: string;
}

/** Builds the four auth headers for a request. */
export function signHeaders(key: StorageKey, o: SignOptions): Record<string, string> {
  const time = o.time ?? Date.now();
  const nonce = o.nonce ?? newNonce();
  const bodySha256Hex = bytesToHex(sha256(o.body ?? new Uint8Array(0)));
  return {
    'X-SK-Storage': key.storageId,
    'X-SK-Time': String(time),
    'X-SK-Nonce': nonce,
    'X-SK-Sig': sign(key.privateKey, { method: o.method, path: o.path, time, nonce, bodySha256Hex }),
  };
}

export function objectUrlPath(path: string): string {
  return `/v1/o/${encodeObjectPath(path)}`;
}
