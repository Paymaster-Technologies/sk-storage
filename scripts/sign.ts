#!/usr/bin/env tsx
// Manual testing helper: derives the storage key from a seed phrase and prints
// curl headers for one request.
//
//   SK_MNEMONIC="word1 … word12" npm run sign -- id
//   SK_MNEMONIC="…" npm run sign -- GET /v1/list
//   SK_MNEMONIC="…" npm run sign -- PUT /v1/o/meta.sk1e ./meta.sk1e
//   SK_MNEMONIC="…" npm run sign -- curl https://storage.example PUT meta.sk1e ./meta.sk1e
//
// With no SK_MNEMONIC a throwaway phrase is generated and printed.

import { readFileSync } from 'node:fs';

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { objectUrlPath, signHeaders, storageKeyFromSeed } from '../src/client.js';

let mnemonic = process.env.SK_MNEMONIC?.trim();
if (!mnemonic) {
  mnemonic = generateMnemonic(wordlist, 128);
  console.error(`# SK_MNEMONIC not set, using a throwaway phrase:\n# ${mnemonic}`);
} else if (!validateMnemonic(mnemonic, wordlist)) {
  console.error('SK_MNEMONIC is not a valid BIP-39 phrase');
  process.exit(2);
}
const key = storageKeyFromSeed(mnemonicToSeedSync(mnemonic));

const [cmd, ...rest] = process.argv.slice(2);

if (!cmd || cmd === 'id') {
  console.log(key.storageId);
  process.exit(0);
}

const headerFlags = (h: Record<string, string>) =>
  Object.entries(h)
    .map(([k, v]) => `-H '${k}: ${v}'`)
    .join(' ');

if (cmd === 'curl') {
  const [base, method, objectPath, file] = rest;
  if (!base || !method) {
    console.error('usage: sign curl <base-url> <METHOD> [object-path] [file]');
    process.exit(2);
  }
  const path = objectPath ? objectUrlPath(objectPath) : method.toUpperCase() === 'DELETE' ? '/v1/all' : '/v1/list';
  const body = file ? new Uint8Array(readFileSync(file)) : undefined;
  const h = signHeaders(key, { method, path, body });
  const data = file ? ` --data-binary @${file}` : '';
  console.log(`curl -sS -X ${method.toUpperCase()} ${headerFlags(h)}${data} '${base.replace(/\/$/, '')}${path}'`);
  process.exit(0);
}

// Raw form: METHOD PATH [file]
const method = cmd;
const [path, file] = rest;
if (!path) {
  console.error('usage: sign <METHOD> <path> [file]   |   sign id   |   sign curl <base> <METHOD> [object] [file]');
  process.exit(2);
}
const body = file ? new Uint8Array(readFileSync(file)) : undefined;
for (const [k, v] of Object.entries(signHeaders(key, { method, path, body }))) console.log(`${k}: ${v}`);
