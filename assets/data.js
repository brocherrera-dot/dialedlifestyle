// Sample data for the Dialed Lifestyle demo.
// All data lives in localStorage so users can mutate it across pages.

const DEFAULT_DATA = {
  coach: {
    name: 'Caden',
    handle: '@caden',
    business: 'Dialed Lifestyle',
  },
  clients: [
    {
      id: 'broc',
      name: 'Broc Herrera',
      city: 'New York, NY',
      lat: 40.7128, lon: -74.0060,
      weight: 200,
      foodBudget: 200,
      tCurrent: 635,
      tGoal: 1000,
      detoxProtocol: 'Standard Environmental Detox Protocol',
      stage: 'Active — Phase 2',
      since: '2026-01-12',
      nextCall: '2026-05-13T15:00:00',
      program: 'Primal Reset · 12 weeks',
      notes: 'Sleep is improving. Reports more morning energy. Pushing T toward 1000+ via lifting + targeted nutrition.',
      bloodMarkers: [
        { name: 'Total Testosterone', unit: 'ng/dL', goal: 1000, history: [
          { date: '2026-01-15', value: 535 },
          { date: '2026-03-01', value: 590 },
          { date: '2026-04-22', value: 635 },
        ]},
        { name: 'Free Testosterone', unit: 'pg/mL', goal: 25, history: [
          { date: '2026-01-15', value: 12.4 },
          { date: '2026-03-01', value: 14.1 },
          { date: '2026-04-22', value: 16.8 },
        ]},
        { name: 'Vitamin D', unit: 'ng/mL', goal: 60, history: [
          { date: '2026-01-15', value: 28 },
          { date: '2026-03-01', value: 41 },
          { date: '2026-04-22', value: 52 },
        ]},
        { name: 'hsCRP', unit: 'mg/L', goal: 0.5, lowerIsBetter: true, history: [
          { date: '2026-01-15', value: 1.8 },
          { date: '2026-03-01', value: 1.1 },
          { date: '2026-04-22', value: 0.7 },
        ]},
        { name: 'Fasting Insulin', unit: 'µIU/mL', goal: 5, lowerIsBetter: true, history: [
          { date: '2026-01-15', value: 9.2 },
          { date: '2026-03-01', value: 7.0 },
          { date: '2026-04-22', value: 5.4 },
        ]},
        { name: 'Ferritin', unit: 'ng/mL', goal: 150, history: [
          { date: '2026-01-15', value: 88 },
          { date: '2026-03-01', value: 110 },
          { date: '2026-04-22', value: 142 },
        ]},
      ],
    },
    {
      id: 'maya',
      name: 'Maya Chen',
      city: 'Austin, TX',
      lat: 30.2672, lon: -97.7431,
      weight: 138,
      foodBudget: 160,
      tCurrent: null,
      tGoal: null,
      detoxProtocol: 'Mold + Heavy Metal',
      stage: 'Onboarding',
      since: '2026-04-28',
      nextCall: '2026-05-10T17:30:00',
      program: 'Foundations · 8 weeks',
      notes: 'Recently moved out of water-damaged apartment. Focus: gut healing + sleep.',
    },
    {
      id: 'jordan',
      name: 'Jordan Pierce',
      city: 'Denver, CO',
      lat: 39.7392, lon: -104.9903,
      weight: 175,
      foodBudget: 220,
      tCurrent: 480,
      tGoal: 850,
      detoxProtocol: 'Plastics + Pesticide',
      stage: 'Active — Phase 1',
      since: '2026-03-04',
      nextCall: '2026-05-09T19:00:00',
      program: 'Hormone Reset · 16 weeks',
      notes: 'High screen exposure. Working on circadian anchoring + outdoor mid-day light.',
    },
    {
      id: 'priya',
      name: 'Priya Shah',
      city: 'San Diego, CA',
      lat: 32.7157, lon: -117.1611,
      weight: 124,
      foodBudget: 180,
      detoxProtocol: 'Standard Environmental Detox Protocol',
      stage: 'Active — Phase 3',
      since: '2025-11-10',
      nextCall: '2026-05-14T14:00:00',
      program: 'Performance · 24 weeks',
      notes: 'Marathon training. Watching iron + ferritin. Wind-down protocol locked in.',
    },
    {
      id: 'leo',
      name: 'Leo Martinez',
      city: 'Miami, FL',
      lat: 25.7617, lon: -80.1918,
      weight: 210,
      foodBudget: 250,
      tCurrent: 412,
      tGoal: 900,
      detoxProtocol: 'Standard Environmental Detox Protocol',
      stage: 'Lead — Discovery scheduled',
      since: '2026-05-02',
      nextCall: '2026-05-12T16:00:00',
      program: '— pending intake',
      notes: 'Discovery call booked. Priors: low energy, sluggish recovery.',
    },
  ],
  payments: [
    { id: 'p1', clientId: 'broc',   amount: 750, status: 'paid',    date: '2026-05-01', method: 'Stripe',  memo: 'Monthly coaching' },
    { id: 'p2', clientId: 'broc',   amount: 295, status: 'paid',    date: '2026-04-22', method: 'Stripe',  memo: 'Lab panel reimburse' },
    { id: 'p3', clientId: 'maya',   amount: 1200, status: 'paid',   date: '2026-04-28', method: 'Stripe',  memo: 'Foundations 8wk pkg' },
    { id: 'p4', clientId: 'jordan', amount: 750, status: 'paid',    date: '2026-05-04', method: 'Stripe',  memo: 'Monthly coaching' },
    { id: 'p5', clientId: 'priya',  amount: 750, status: 'pending', date: '2026-05-08', method: 'Invoice', memo: 'Monthly coaching' },
    { id: 'p6', clientId: 'leo',    amount: 0,   status: 'pending', date: '2026-05-12', method: 'Invoice', memo: 'Discovery — no charge' },
  ],
  recipes: [
    { id: 'r1', name: 'Pasture-Raised Steak & Eggs', tags: ['T-supportive', 'Primal', 'Breakfast'], time: 15,
      ingredients: ['8oz grass-fed ribeye', '3 pasture eggs', '1 tbsp grass-fed butter', 'Sea salt', 'Cracked pepper'],
      method: 'Sear ribeye 3 min/side in butter. Rest 5 min. Cook eggs over-easy in pan drippings. Salt to taste.' },
    { id: 'r2', name: 'Wild Salmon, Asparagus & Sweet Potato', tags: ['Anti-inflammatory', 'Dinner'], time: 25,
      ingredients: ['6oz wild Alaskan salmon', '1 bunch asparagus', '1 medium sweet potato', '2 tbsp olive oil', 'Lemon, sea salt'],
      method: 'Roast sweet potato wedges 400°F 25 min. Pan-sear salmon skin-down 4 min, flip 2 min. Steam asparagus 5 min, finish with olive oil and lemon.' },
    { id: 'r3', name: 'Liver, Onion & Avocado Bowl', tags: ['Nutrient-dense', 'T-supportive'], time: 20,
      ingredients: ['6oz grass-fed beef liver', '1 yellow onion', '1 avocado', '2 tbsp ghee', 'Sea salt'],
      method: 'Slow-cook onion in ghee 8 min until jammy. Pan-sear sliced liver 90 sec/side. Plate with sliced avocado and salt.' },
    { id: 'r4', name: 'Bone Broth & Pasture Chicken Soup', tags: ['Gut healing', 'Detox'], time: 35,
      ingredients: ['1 quart pasture bone broth', '8oz pasture chicken thighs', '1 carrot', '2 stalks celery', 'Garlic, thyme'],
      method: 'Simmer broth with diced carrot/celery and garlic 15 min. Add cubed chicken, simmer 12 min. Finish with thyme.' },
    { id: 'r5', name: 'Wild Berry & Raw Honey Yogurt', tags: ['Recovery', 'Snack'], time: 5,
      ingredients: ['1 cup grass-fed full-fat yogurt', '1/2 cup wild blueberries', '1 tbsp raw honey', '2 tbsp pumpkin seeds'],
      method: 'Layer yogurt, berries, honey, seeds. Eat immediately.' },
    { id: 'r6', name: 'Sardines on Sourdough w/ Cultured Butter', tags: ['Omega-3', 'Quick'], time: 8,
      ingredients: ['1 tin wild sardines (olive oil)', '2 slices true sourdough', '2 tbsp cultured butter', 'Lemon, parsley'],
      method: 'Toast sourdough, slather with butter. Top with sardines. Squeeze lemon, scatter parsley.' },
  ],
  articles: [
    { id: 'a1', title: 'The Light Diet: Why Sunrise Is the Most Important Meal of the Day',
      tag: 'Circadian',
      excerpt: 'Photons hitting your retina before 9am set the daily clock for hormones, mood, and metabolism. Here is how to dial it in — even from a glass-walled apartment in NYC.',
      body: 'Sunrise light is rich in red and infrared wavelengths that prime mitochondria and trigger a clean cortisol pulse. Aim for 5–10 minutes of direct outdoor light within 60 minutes of waking. No sunglasses. No window glass. If the sun is below the horizon, dim indoor lighting and head out as soon as you can see the horizon brighten.' },
    { id: 'a2', title: 'A Primal Whole-Foods Plate (Without the Dogma)',
      tag: 'Nutrition',
      excerpt: 'Pasture-raised animal protein, seasonal produce, fermented foods, and an honest source of fat. That is the entire system.',
      body: 'Build every plate from three components: a fist of pasture-raised protein, two fists of mixed plants (cooked + raw), and a thumb of clean fat. Skip seed oils, ultra-processed snacks, and anything labeled "natural flavor." Eat with people when you can. Stop one bite before full.' },
    { id: 'a3', title: 'Mid-Day Sun Is Not the Enemy',
      tag: 'Circadian',
      excerpt: 'A short, intentional dose of solar noon light builds your solar callus and supports vitamin D, nitric oxide, and mood.',
      body: 'Skin tone, season, and latitude all factor in — but for most people, 10–20 minutes of mid-day sun on bare skin (no burning) is therapeutic, not dangerous. Build the callus gradually. Eat well first. Avoid mineral sunscreens during the build-up window.' },
    { id: 'a4', title: 'Why Cheap Tap Water Is Quietly Hijacking Your Hormones',
      tag: 'Detox',
      excerpt: 'Atrazine, fluoride, microplastics, and pharmaceutical residue. A short audit of what is in your glass and how to upgrade.',
      body: 'Most municipal water reports list what is regulated — not what is present. A solid carbon + reverse-osmosis system handles the bulk of common contaminants. Re-mineralize with a pinch of unrefined sea salt and trace minerals.' },
    { id: 'a5', title: 'Sleep Is the Cheapest Performance Drug You Are Ignoring',
      tag: 'Recovery',
      excerpt: 'The 90-minute pre-bed window decides whether tomorrow is excellent or average.',
      body: 'Lights down 90 minutes before bed. Last bite 3+ hours before bed. Cool, dark, quiet room. Same wake time every day, including weekends. That is most of it.' },
    { id: 'a6', title: 'Building Your Detox Capacity Before You Try to Detox',
      tag: 'Detox',
      excerpt: 'Mobilizing toxins without open drainage pathways is how people end up worse than when they started.',
      body: 'Open the funnel from the bottom up: bowels → liver → kidneys → lymph → cells. Skip the binders until you are pooping daily, sweating regularly, and drinking real water in real glasses.' },
  ],
};

const STORAGE_KEY = 'dialed-lifestyle-data-v1';

// Cache the most recently loaded state so synchronous callers (the existing
// route renderers) can keep doing `state = DialedData.loadData()`.
let cache = null;
let mode = 'localStorage'; // or 'api' once boot() succeeds against the server.

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}
function writeLocal(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

// Detects whether we're being served from a real HTTP origin (so /api/* will
// resolve) vs. a file:// or static-only host (where the API is unreachable).
function apiAvailable() {
  return typeof location !== 'undefined' &&
    (location.protocol === 'http:' || location.protocol === 'https:');
}

async function boot() {
  if (apiAvailable()) {
    try {
      const res = await fetch('/api/state', { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const d = await res.json();
        if (d && d.clients) {
          cache = d;
          mode = 'api';
          writeLocal(d); // mirror so reloads without server still work
          return d;
        }
      }
    } catch { /* network error — fall back below */ }
  }
  cache = readLocal() || JSON.parse(JSON.stringify(DEFAULT_DATA));
  writeLocal(cache);
  mode = 'localStorage';
  return cache;
}

function loadData() {
  if (cache) return cache;
  cache = readLocal() || JSON.parse(JSON.stringify(DEFAULT_DATA));
  return cache;
}

function saveData(d) {
  cache = d;
  writeLocal(d);
  if (mode === 'api') {
    // Fire-and-forget; we already wrote to localStorage so the user-visible
    // state survives even if the request fails.
    fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    }).catch(() => { /* ignore */ });
  }
}

async function resetData() {
  if (mode === 'api') {
    try {
      const res = await fetch('/api/state/reset', { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        cache = d; writeLocal(d);
        return d;
      }
    } catch { /* fall through */ }
  }
  localStorage.removeItem(STORAGE_KEY);
  cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
  writeLocal(cache);
  return cache;
}

function getClient(id) {
  const d = loadData();
  return d.clients.find(c => c.id === id);
}

function getMode() { return mode; }

window.DialedData = { boot, loadData, saveData, resetData, getClient, getMode, DEFAULT_DATA };
