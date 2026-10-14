// Object paths. A client mirrors its archive directory, so a path is a
// relative file path inside that directory: `meta.sk1e`,
// `.storage/records.sk1e`, `sk1.../messages.ndjson`. The URL form is
// `/v1/o/<path>` with each segment percent-encoded; after decoding we accept a
// deliberately narrow alphabet, which also rules out traversal.

export const MAX_SEGMENT = 255;
export const MAX_DEPTH = 8;
export const MAX_PATH = 1024;

const SEGMENT_RE = /^[A-Za-z0-9._-]+$/;

/** Returns the normalized path or null when the path is not acceptable. */
export function parseObjectPath(raw: string): string | null {
  if (!raw || raw.length > MAX_PATH * 3) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (decoded.length > MAX_PATH) return null;
  const segments = decoded.split('/');
  if (segments.length > MAX_DEPTH) return null;
  for (const s of segments) {
    if (!s || s === '.' || s === '..' || s.length > MAX_SEGMENT || !SEGMENT_RE.test(s)) return null;
  }
  return segments.join('/');
}

/** Percent-encodes a normalized path for use in a URL. */
export function encodeObjectPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}
