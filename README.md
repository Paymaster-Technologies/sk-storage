# Secret Keeper storage

A small object server for the Secret Keeper cloud copy. The app mirrors its
archive directory here; every file in that directory is already an envelope
encrypted to the owner's own keys, so the server only ever sees ciphertext
and never takes part in the cryptography. One instance serves many users;
each is identified by a storage key derived from their seed phrase, and
nothing about that key links to the user's `sk1…` address.

Run it anywhere: a VPS, a home NAS, a Raspberry Pi. The app lets you point
the cloud copy at your own server instead of the default one.

## Run

```sh
cp .env.example .env        # optional, all values have defaults
docker compose up -d        # listens on 127.0.0.1:4323, objects in ./data
```

Put a TLS reverse proxy in front and forward `https://storage.example.com/`
to `http://127.0.0.1:4323/`. Make sure the proxy allows request bodies of at
least `MAX_OBJECT_BYTES` (nginx: `client_max_body_size 512m;`) and does not
time out long uploads.

Without Docker: Node 22+, `npm ci && npm run build && DATA_DIR=./data npm start`.

| Variable | Default | Meaning |
|---|---|---|
| `PORT` / `HOST` | `4323` / `0.0.0.0` | Listen address |
| `DATA_DIR` | `/data` | Where objects are stored |
| `QUOTA_BYTES` | `1GiB` | Byte budget per storage-id |
| `MAX_OBJECT_BYTES` | `512MiB` | Largest single object |
| `SKEW_MS` | `300000` | Tolerated clock difference, ms |

## Protocol (SKS1)

### Identity

```
storage private key = HKDF-SHA256(ikm = BIP-39 seed, salt = empty,
                                  info = "secret-keeper/storage-ed25519/v1", L = 32)
storage public key  = Ed25519(private key)
storage-id          = bech32(hrp "sks", public key)        e.g. sks1qq…
```

The seed is the same 64-byte BIP-39 seed Secret Keeper derives its identity
keys from. Different HKDF `info` means the storage key cannot be computed
from the address key or vice versa.

### Request signing

Every `/v1/*` request carries four headers:

| Header | Value |
|---|---|
| `X-SK-Storage` | storage-id |
| `X-SK-Time` | client clock, unix milliseconds |
| `X-SK-Nonce` | 16..128 chars of `[A-Za-z0-9_=-]`, unique per request |
| `X-SK-Sig` | base64 of the Ed25519 signature over the signing string |

Signing string (UTF-8, lines joined with `\n`, no trailing newline):

```
SKS1
{METHOD}                     upper case
{path}                       request path with query, exactly as sent
{time}
{nonce}
{sha256(body) as lower hex}  sha256("") for bodiless requests
```

The server rejects requests whose `X-SK-Time` differs from its clock by more
than `SKEW_MS` and remembers nonces for twice that window, so a captured
request cannot be replayed. Every `/v1` response carries `X-SK-Server-Time`
so a client with a wrong clock can correct itself.

### Objects

An object path is a relative file path inside the archive directory
(`meta.sk1e`, `.storage/records.sk1e`, `sk1…/messages.ndjson`). Up to 8
segments of `[A-Za-z0-9._-]`, no `.` or `..`. In URLs each segment is
percent-encoded: `/v1/o/.storage/records.sk1e`.

| Request | Result |
|---|---|
| `GET /` | landing page for people (HTML in the nine site languages, initial pick by `Accept-Language`, theme and language controls with the site's hotkeys); also `/favicon.ico`, `/icon-*.png`, `/robots.txt` (disallow all) and `/.well-known/security.txt` |
| `GET /healthz` | `{"ok":true,"time":…}`, no auth |
| `GET /v1/list` | `[{"path","size","etag","mtime"}]` sorted by path |
| `GET /v1/usage` | `{"used","quota","maxObject"}` in bytes |
| `PUT /v1/o/<path>` | stores the body; `201` new, `200` replaced; honours `If-Match` / `If-None-Match` (`*` allowed) |
| `GET /v1/o/<path>` | body with `ETag`, `Content-Length`, `Last-Modified`; `If-None-Match` → `304` |
| `HEAD /v1/o/<path>` | headers only |
| `DELETE /v1/o/<path>` | removes one object; honours `If-Match` |
| `DELETE /v1/all` | removes everything under the storage-id |

`etag` is the lower-hex sha256 of the body. Errors are JSON
`{"error": "<code>", "message": "…"}`: `401 auth-*` (missing headers, bad
signature, replay, clock skew), `400 bad-path`, `404 not-found`,
`412 precondition-failed`, `413 too-large` / `413 quota`.

Uploads are streamed to a temporary file and renamed into place after the
signature has been checked against the actual body hash, so a crash or a
forged body never leaves a half-written or unauthenticated object.

### Not in this version

Per-account manifest signed by the client (rollback protection), tombstones
and merging of same-named files from several devices. The pilot's client only
adds and replaces objects and never deletes remote-only ones: one seed lives
on several devices, so the account is the union of their archives.

## Try it with curl

```sh
npm ci
export SK_MNEMONIC="twelve words of a test phrase …"   # omit to get a throwaway one
npm run sign -- id                                     # prints the storage-id
eval "$(npm run -s sign -- curl http://127.0.0.1:4323 PUT meta.sk1e ./meta.sk1e)"
eval "$(npm run -s sign -- curl http://127.0.0.1:4323 GET)"            # list
eval "$(npm run -s sign -- curl http://127.0.0.1:4323 GET meta.sk1e)"  # download
```

## Develop

```sh
npm ci
npm test            # vitest
npm run dev         # tsx src/server.ts on :4323 with DATA_DIR=/data (set your own)
```

`deploy.sh` ships the sources to a Synology NAS over SSH and rebuilds the
container there (`NAS=user@host ./deploy.sh`, or put `NAS` and `NAS_DIR`
in a gitignored `.deploy.env`). It is written for DSM but shows the steps
for any Docker host.

## Storage layout

```
DATA_DIR/<storage-id>/o/<path>     object bodies
DATA_DIR/<storage-id>/tmp/         uploads in flight
DATA_DIR/<storage-id>/index.json   path → {size, etag, mtime}; rebuilt from o/ if lost
```

Backups of `DATA_DIR` are plain files; the content is ciphertext the owner
can decrypt with their seed phrase only.

## License

MIT, see [LICENSE](LICENSE).
