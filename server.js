import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, 'data', 'seed.json');
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

// Server-side mirror of the photo catalog so /uploads/:key can resolve a
// reasonable default when no upload exists yet. Keep the keyword/lock pairs
// in sync with PHOTOS in assets/app.js.
const PHOTO_DEFAULTS = {
  heroBg:        { keywords: 'sunrise,horizon,nature',           w: 1920, h: 1080, lock: 1001 },
  heroVisual:    { keywords: 'sunrise,running,silhouette',       w: 900,  h: 900,  lock: 1002 },
  testimonial:   { keywords: 'man,fitness,athletic,portrait',    w: 600,  h: 750,  lock: 1003 },
  showcaseSun:   { keywords: 'sunrise,golden,sky',               w: 800,  h: 1000, lock: 1101 },
  showcasePlate: { keywords: 'wholefoods,plate,wholesome',       w: 800,  h: 1000, lock: 1102 },
  showcaseBody:  { keywords: 'fitness,athlete,torso',            w: 800,  h: 1000, lock: 1103 },
  coachBanner:   { keywords: 'sunrise,morning,light',            w: 1600, h: 400,  lock: 2001 },
  clientBanner:  { keywords: 'sunrise,horizon,calm',             w: 1600, h: 400,  lock: 2002 },
  programBanner: { keywords: 'mountain,sunrise,trail',           w: 1600, h: 400,  lock: 2003 },
  r1: { keywords: 'steak,eggs,plate',           w: 800, h: 600, lock: 3001 },
  r2: { keywords: 'salmon,asparagus,plate',     w: 800, h: 600, lock: 3002 },
  r3: { keywords: 'liver,onion,plate',          w: 800, h: 600, lock: 3003 },
  r4: { keywords: 'bone,broth,soup',            w: 800, h: 600, lock: 3004 },
  r5: { keywords: 'yogurt,berries,bowl',        w: 800, h: 600, lock: 3005 },
  r6: { keywords: 'sardines,sourdough,toast',   w: 800, h: 600, lock: 3006 },
  a1: { keywords: 'sunrise,horizon,morning',    w: 1600, h: 900, lock: 4001 },
  a2: { keywords: 'wholefoods,plate,wholesome', w: 1600, h: 900, lock: 4002 },
  a3: { keywords: 'sun,beach,bright,solar',     w: 1600, h: 900, lock: 4003 },
  a4: { keywords: 'water,glass,pour,clean',     w: 1600, h: 900, lock: 4004 },
  a5: { keywords: 'bedroom,bed,calm,night',     w: 1600, h: 900, lock: 4005 },
  a6: { keywords: 'lemon,herbs,water,detox',    w: 1600, h: 900, lock: 4006 },
};

function defaultPhotoUrl(key) {
  const p = PHOTO_DEFAULTS[key];
  if (!p) return null;
  return `https://loremflickr.com/${p.w}/${p.h}/${encodeURIComponent(p.keywords)}/all?lock=${p.lock}`;
}

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

let state = (() => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const d = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      if (!d.uploads) d.uploads = {};
      return d;
    } catch { /* fall through to seed */ }
  }
  const seed = loadSeed();
  if (!seed.uploads) seed.uploads = {};
  fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  return seed;
})();

let saveQueued = false;
function persist() {
  if (saveQueued) return;
  saveQueued = true;
  setImmediate(() => {
    saveQueued = false;
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
  });
}

const app = express();
app.use(express.json({ limit: '20mb' }));

app.get('/api/state', (_req, res) => res.json(state));

app.put('/api/state', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'invalid body' });
  }
  // Preserve uploads — they're managed via dedicated endpoints.
  const incoming = req.body;
  if (state.uploads) incoming.uploads = state.uploads;
  state = incoming;
  persist();
  res.json({ ok: true });
});

app.post('/api/state/reset', (_req, res) => {
  const fresh = loadSeed();
  fresh.uploads = state.uploads || {}; // keep uploads through resets
  state = fresh;
  persist();
  res.json(state);
});

// ---------- Granular endpoints ----------
app.get('/api/clients', (_req, res) => res.json(state.clients));
app.get('/api/clients/:id', (req, res) => {
  const c = state.clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});
app.patch('/api/clients/:id', (req, res) => {
  const c = state.clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  Object.assign(c, req.body);
  persist();
  res.json(c);
});
app.post('/api/clients', (req, res) => {
  const c = req.body;
  if (!c?.id || !c?.name) return res.status(400).json({ error: 'id and name required' });
  if (state.clients.some(x => x.id === c.id)) return res.status(409).json({ error: 'exists' });
  state.clients.push(c);
  persist();
  res.json(c);
});

app.get('/api/payments', (_req, res) => res.json(state.payments));
app.post('/api/payments', (req, res) => {
  const p = { id: 'p' + Date.now(), ...req.body };
  state.payments.unshift(p);
  persist();
  res.json(p);
});

app.post('/api/markers/:clientId/log', (req, res) => {
  const c = state.clients.find(x => x.id === req.params.clientId);
  if (!c?.bloodMarkers) return res.status(404).json({ error: 'no markers' });
  const { name, value, date } = req.body || {};
  const m = c.bloodMarkers.find(x => x.name === name);
  if (!m) return res.status(404).json({ error: 'marker not found' });
  m.history.push({ date: date || new Date().toISOString().slice(0, 10), value });
  persist();
  res.json(m);
});

app.get('/api/recipes',  (_req, res) => res.json(state.recipes));
app.get('/api/articles', (_req, res) => res.json(state.articles));

// ---------- Image upload management ----------
app.get('/api/uploads', (_req, res) => res.json({
  slots: PHOTO_DEFAULTS,
  uploads: state.uploads || {},
}));

app.post('/api/uploads/:key', (req, res) => {
  const { key } = req.params;
  if (!PHOTO_DEFAULTS[key]) return res.status(404).json({ error: 'unknown slot' });
  const { dataUrl, filename } = req.body || {};
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'dataUrl required' });
  }
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+\-.]+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'invalid data URL' });
  const mime = m[1];
  const ext = ({
    'image/jpeg': 'jpg', 'image/jpg': 'jpg',
    'image/png': 'png',  'image/webp': 'webp',
    'image/gif': 'gif',  'image/avif': 'avif',
  })[mime] || 'bin';
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 18 * 1024 * 1024) return res.status(413).json({ error: 'file too large (max 18MB)' });

  // Remove any existing file for this slot, regardless of extension.
  for (const f of fs.readdirSync(UPLOAD_DIR)) {
    if (f.startsWith(key + '.')) fs.unlinkSync(path.join(UPLOAD_DIR, f));
  }
  const filePath = path.join(UPLOAD_DIR, `${key}.${ext}`);
  fs.writeFileSync(filePath, buf);

  state.uploads = state.uploads || {};
  state.uploads[key] = {
    file: `${key}.${ext}`,
    mime,
    size: buf.length,
    original: filename || null,
    uploadedAt: new Date().toISOString(),
  };
  persist();
  res.json({ ok: true, key, ...state.uploads[key] });
});

app.delete('/api/uploads/:key', (req, res) => {
  const { key } = req.params;
  for (const f of fs.readdirSync(UPLOAD_DIR)) {
    if (f.startsWith(key + '.')) fs.unlinkSync(path.join(UPLOAD_DIR, f));
  }
  if (state.uploads) delete state.uploads[key];
  persist();
  res.json({ ok: true });
});

// Image dispatcher: serve the uploaded file if present, otherwise redirect to
// a themed loremflickr default. Used everywhere via /uploads/<key>.
app.get('/uploads/:key', (req, res) => {
  const { key } = req.params;
  for (const f of fs.readdirSync(UPLOAD_DIR)) {
    if (f.startsWith(key + '.')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(path.join(UPLOAD_DIR, f));
    }
  }
  const fallback = defaultPhotoUrl(key);
  if (fallback) return res.redirect(302, fallback);
  res.status(404).send('Not found');
});

// ---------- Static site ----------
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, file) => {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-store');
  },
}));

app.listen(PORT, HOST, () => {
  console.log(`\n  Dialed Lifestyle is live:`);
  console.log(`  → http://${HOST}:${PORT}/             (landing)`);
  console.log(`  → http://${HOST}:${PORT}/coach.html   (coach console)`);
  console.log(`  → http://${HOST}:${PORT}/client.html  (client portal)`);
  console.log(`  → http://${HOST}:${PORT}/images.html  (image manager)\n`);
  console.log(`  Database: ${DB_PATH}`);
  console.log(`  Uploads:  ${UPLOAD_DIR}`);
  console.log(`  Reset with: curl -X POST http://${HOST}:${PORT}/api/state/reset\n`);
});
