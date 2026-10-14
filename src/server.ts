// Entry point: HTTP on HOST:PORT, objects under DATA_DIR. TLS is the reverse
// proxy's job (nginx / Synology DSM / Caddy).

import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';

import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { DiskBackend } from './store/disk.js';

let config;
try {
  config = loadConfig();
  mkdirSync(config.dataDir, { recursive: true });
} catch (e) {
  console.error(`sk storage: configuration error: ${(e as Error).message}`);
  process.exit(1);
}

const handler = createApp({
  config,
  backend: new DiskBackend(config.dataDir),
  log: (line) => console.log(`${new Date().toISOString()} ${line}`),
});

const server = createServer((req, res) => {
  void handler(req, res);
});
// Uploads of a few hundred MB over slow links take a while; do not cut them.
server.requestTimeout = 0;
server.headersTimeout = 60_000;
server.listen(config.port, config.host, () => {
  console.log(
    `sk storage on http://${config.host}:${config.port}, data ${config.dataDir}, quota ${config.quotaBytes} B, max object ${config.maxObjectBytes} B`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
