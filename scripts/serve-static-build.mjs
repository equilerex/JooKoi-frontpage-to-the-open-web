#!/usr/bin/env node
// Serves the production Angular build from dist/jookoi-frontpage/browser/ with
// Node built-ins only (no Express/serve/http-server). Unknown paths get
// index.csr.html (the CSR fallback) instead of index.html, so client-side
// routing renders NotFoundPage rather than showing the prerendered home page.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', 'dist', 'jookoi-frontpage', 'browser');
const indexFile = join(rootDir, 'index.html');
const csrFallbackFile = join(rootDir, 'index.csr.html');
const port = Number(process.env.PORT) || 4321;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const DEFAULT_MIME_TYPE = 'application/octet-stream';

function mimeTypeFor(filePath) {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? DEFAULT_MIME_TYPE;
}

async function resolveRequestedFile(requestPath) {
  if (requestPath === '/') {
    return indexFile;
  }

  // Strip query/hash, decode, and normalize away any `..` traversal attempts.
  const decodedPath = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
  const candidate = normalize(join(rootDir, decodedPath));
  if (!candidate.startsWith(rootDir + sep) && candidate !== rootDir) {
    return null;
  }

  try {
    const info = await stat(candidate);
    if (info.isFile()) {
      return candidate;
    }
  } catch {
    // Not a file on disk — fall through to the CSR fallback.
  }
  return null;
}

const server = createServer(async (req, res) => {
  const requestedFile = await resolveRequestedFile(req.url ?? '/');
  const filePath = requestedFile ?? csrFallbackFile;

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypeFor(filePath) });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Failed to serve ${filePath}: ${err.message}`);
  }
});

server.listen(port, () => {
  console.log(`Serving dist/jookoi-frontpage/browser at http://localhost:${port}`);
});
