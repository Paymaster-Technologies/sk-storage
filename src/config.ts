// Server configuration from the environment. Everything has a default so
// `docker compose up` works without a .env; the numbers are byte counts.

export interface Config {
  host: string;
  port: number;
  dataDir: string;
  /** Per storage-id byte quota (sum of object sizes). */
  quotaBytes: number;
  /** Largest single object accepted. */
  maxObjectBytes: number;
  /** Accepted clock skew between client X-SK-Time and server time, ms. */
  skewMs: number;
}

const GIB = 1024 * 1024 * 1024;
const MIB = 1024 * 1024;

function bytes(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const m = /^(\d+)\s*([kmg]i?b?)?$/i.exec(raw);
  if (!m) throw new Error(`${name}="${raw}" is not a byte count (examples: 1073741824, 512MiB, 1GiB)`);
  const n = Number(m[1]);
  const unit = (m[2] ?? '').toLowerCase()[0];
  const mult = unit === 'k' ? 1024 : unit === 'm' ? MIB : unit === 'g' ? GIB : 1;
  return n * mult;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    host: env.HOST ?? '0.0.0.0',
    port: Number(env.PORT ?? 4323),
    dataDir: env.DATA_DIR ?? '/data',
    quotaBytes: bytes(env, 'QUOTA_BYTES', 1 * GIB),
    maxObjectBytes: bytes(env, 'MAX_OBJECT_BYTES', 512 * MIB),
    skewMs: Number(env.SKEW_MS ?? 5 * 60 * 1000),
  };
}
