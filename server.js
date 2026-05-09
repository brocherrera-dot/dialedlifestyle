import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, 'data', 'seed.json');
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

let state = (() => {
  if (fs.existsSync(DB_PATH)) {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
    catch { /* fall through to seed */ }
  }
  const seed = loadSeed();
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
app.use(express.json({ limit: '1mb' }));

app.get('/api/state', (_req, res) => res.json(state));

app.put('/api/state', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'invalid body' });
  }
  state = req.body;
  persist();
  res.json({ ok: true });
});

app.post('/api/state/reset', (_req, res) => {
  state = loadSeed();
  persist();
  res.json(state);
});

// ---------- Granular endpoints (optional, for stricter clients) ----------
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

// ---------- Static site ----------
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, file) => {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-store');
  },
}));

app.listen(PORT, HOST, () => {
  console.log(`\n  Dialed Lifestyle is live:`);
  console.log(`  → http://${HOST}:${PORT}/           (landing)`);
  console.log(`  → http://${HOST}:${PORT}/coach.html (coach console)`);
  console.log(`  → http://${HOST}:${PORT}/client.html (client portal)\n`);
  console.log(`  Database: ${DB_PATH}`);
  console.log(`  Reset with: curl -X POST http://${HOST}:${PORT}/api/state/reset\n`);
});
