// Shared UI helpers for Dialed Lifestyle
(function () {
  // ---------- Utilities ----------
  const fmtMoney = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const fmtDateLong = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  const initials = (name) => name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ---------- Tab activation ----------
  function activateTabs(root) {
    root.querySelectorAll('[data-tabs]').forEach(group => {
      const buttons = group.querySelectorAll('.tab');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.target;
          const scope = group.closest('[data-tabs-scope]') || document;
          scope.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
          scope.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const panel = scope.querySelector('[data-panel="' + target + '"]');
          if (panel) panel.classList.add('active');
        });
      });
    });
  }

  // ---------- Sun calculations (NOAA-style, simplified) ----------
  // Returns sunrise, sunset, solar noon, civil twilight, golden hour windows.
  function julianDate(date) {
    return date.getTime() / 86400000 - date.getTimezoneOffset() / 1440 + 2440587.5;
  }
  function solarTimes(date, lat, lon) {
    // Simplified NOAA solar position approximation.
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;
    const n = Math.floor(julianDate(date) - 2451545.0 + 0.0008);
    const Jstar = n - lon / 360;
    const M = (357.5291 + 0.98560028 * Jstar) % 360;
    const C = 1.9148 * Math.sin(M * rad) + 0.0200 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const lambda = (M + C + 180 + 102.9372) % 360;
    const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    const declination = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad)) * deg;

    function hourAngle(altitudeDeg) {
      const cosH = (Math.sin(altitudeDeg * rad) - Math.sin(lat * rad) * Math.sin(declination * rad))
        / (Math.cos(lat * rad) * Math.cos(declination * rad));
      if (cosH > 1) return null; // sun never reaches that altitude
      if (cosH < -1) return null;
      return Math.acos(cosH) * deg;
    }

    function jdToDate(jd) {
      const ms = (jd - 2440587.5) * 86400000;
      return new Date(ms);
    }

    const Hsunrise = hourAngle(-0.833);
    const Hcivil = hourAngle(-6);
    const Hgolden = hourAngle(6);

    const out = { solarNoon: jdToDate(Jtransit), declination };
    if (Hsunrise != null) {
      out.sunrise = jdToDate(Jtransit - Hsunrise / 360);
      out.sunset  = jdToDate(Jtransit + Hsunrise / 360);
    }
    if (Hcivil != null) {
      out.civilDawn = jdToDate(Jtransit - Hcivil / 360);
      out.civilDusk = jdToDate(Jtransit + Hcivil / 360);
    }
    if (Hgolden != null) {
      out.goldenStart = jdToDate(Jtransit - Hgolden / 360);
      out.goldenEnd   = jdToDate(Jtransit + Hgolden / 360);
    }
    return out;
  }

  // Suggest sleep/wake based on chronotype + sunrise.
  function circadianSchedule(times, chronotype = 'neutral') {
    const sr = times.sunrise;
    const offset = chronotype === 'lark' ? -30 : chronotype === 'owl' ? 30 : 0;
    const wake = new Date(sr.getTime() + offset * 60000);
    const sleep = new Date(wake.getTime() + (16 * 60) * 60000); // 16h awake → 8h sleep
    const lastFood = new Date(sleep.getTime() - 3 * 60 * 60000);
    const screensOff = new Date(sleep.getTime() - 90 * 60000);
    const peakSun = times.solarNoon;
    const peakSunStart = new Date(peakSun.getTime() - 15 * 60000);
    const peakSunEnd   = new Date(peakSun.getTime() + 15 * 60000);
    return { wake, sleep, lastFood, screensOff, peakSunStart, peakSunEnd };
  }

  // ---------- Detox protocol generator ----------
  const DETOX_PROTOCOLS = {
    'Standard Environmental Detox Protocol': {
      summary: 'A 90-day baseline protocol for adults with general environmental load (pesticides, plastics, air pollution, low-grade metals).',
      pillars: [
        { name: 'Drainage', items: [
          'Bowels: 1–2 daily complete movements before adding binders',
          'Hydration: ½ body weight in oz of filtered water + pinch of mineral salt',
          'Lymph: 10 min rebounder or dry brushing daily',
          'Sweat: 3× weekly sauna (15–25 min) or hot/cold contrast',
        ]},
        { name: 'Liver / Phase I & II support', items: [
          'Cruciferous vegetables: 2 cups daily (broccoli sprouts, arugula, kale)',
          'Pasture egg yolks 2–3 daily for choline + sulfur',
          'Glycine: 3g pre-bed (or bone broth at dinner)',
          'Castor oil pack 4×/week, 30 min',
        ]},
        { name: 'Binders (week 4+, only if drainage open)', items: [
          'Activated charcoal: 1g away from food, 1×/day',
          'Bentonite clay: 1 tsp in water, evening',
          'Chlorella: 2g with meals containing fish or seafood',
        ]},
        { name: 'Environment', items: [
          'Filter water: carbon block + RO',
          'Air filter (HEPA + carbon) in bedroom',
          'Replace plastic food storage with glass',
          'Switch personal care to fragrance-free, paraben-free',
        ]},
      ],
      labs: ['GGT', 'Bilirubin (total + direct)', 'AST/ALT', 'hsCRP', 'Vitamin D', 'Glutathione (whole-blood)'],
    },
    'Mold + Heavy Metal': {
      summary: 'Targeted protocol for mycotoxin and heavy-metal load, typically post-exposure.',
      pillars: [
        { name: 'Source removal (non-negotiable)', items: [
          'Confirm building remediation; ERMI ≤ 2',
          'Replace soft goods that lived in damp space',
          'HEPA vacuum every 3 days for 30 days',
        ]},
        { name: 'Drainage', items: [
          'Daily bowel movements before binders',
          '3× weekly sauna with electrolyte replacement',
          'Coffee enema 1–2×/week if tolerated',
        ]},
        { name: 'Binders (rotate)', items: [
          'Cholestyramine 4g pre-meal (Rx)',
          'Bentonite clay + activated charcoal stack',
          'Modified citrus pectin between meals',
          'Chlorella before fish meals',
        ]},
        { name: 'Repair', items: [
          'Glutathione (liposomal) 250–500mg AM',
          'Omega-3 (small fish): 2–3g daily',
          'Phosphatidylcholine 1.2g w/ meals',
        ]},
      ],
      labs: ['Mycotoxin urine panel', 'Hair mineral analysis', 'Provoked urine metals', 'GGT', 'Glutathione'],
    },
    'Plastics + Pesticide': {
      summary: 'Focus on phthalates, BPA/BPS, glyphosate, and organochlorines.',
      pillars: [
        { name: 'Source reduction', items: [
          'Eliminate plastic food contact (storage + drink ware)',
          '100% organic produce on the EWG Dirty Dozen',
          'Pasture/grass-finished animal products only',
          'Switch dish soap, laundry, deodorant to clean alts',
        ]},
        { name: 'Drainage', items: [
          'Daily bowels; magnesium glycinate 400mg pre-bed if needed',
          '2–3× weekly sauna',
          'Castor oil packs 3×/week',
        ]},
        { name: 'Binders', items: [
          'Activated charcoal 1g, 2×/week',
          'Glycine 3g pre-bed',
          'Glucaric acid (Calcium D-Glucarate) 500mg w/ meals',
        ]},
        { name: 'Support', items: [
          'Glutathione precursors (NAC 600mg AM)',
          'Cruciferous vegetables daily',
          'Filtered water w/ minerals',
        ]},
      ],
      labs: ['Glyphosate urine', 'Phthalate metabolite urine', 'GGT', 'hsCRP', 'Vitamin D'],
    },
  };

  function buildDetoxProtocol(name) {
    return DETOX_PROTOCOLS[name] || DETOX_PROTOCOLS['Standard Environmental Detox Protocol'];
  }

  // ---------- Whole foods catalog with prices (per unit) ----------
  // Two sources: 'wholefoods' (per-lb retail-ish), 'costco' (bulk, lower per-unit).
  const FOOD_CATALOG = [
    // protein
    { id: 'ribeye',    name: 'Grass-fed Ribeye',         category: 'Protein', unit: 'lb',  serving: 0.5, prices: { wholefoods: 28, costco: 18 } },
    { id: 'ground',    name: 'Grass-fed Ground Beef',    category: 'Protein', unit: 'lb',  serving: 0.4, prices: { wholefoods: 12, costco: 7.5 } },
    { id: 'salmon',    name: 'Wild Alaskan Salmon',      category: 'Protein', unit: 'lb',  serving: 0.4, prices: { wholefoods: 22, costco: 14 } },
    { id: 'eggs',      name: 'Pasture Eggs (dozen)',     category: 'Protein', unit: 'dozen', serving: 0.25, prices: { wholefoods: 9,  costco: 6 } },
    { id: 'chicken',   name: 'Pasture Chicken Thighs',   category: 'Protein', unit: 'lb',  serving: 0.4, prices: { wholefoods: 9,  costco: 5.5 } },
    { id: 'liver',     name: 'Grass-fed Beef Liver',     category: 'Protein', unit: 'lb',  serving: 0.25, prices: { wholefoods: 10, costco: 7 } },
    { id: 'sardines',  name: 'Wild Sardines (tin)',      category: 'Protein', unit: 'tin', serving: 1, prices: { wholefoods: 4.5, costco: 2.8 } },
    // produce
    { id: 'avocado',   name: 'Avocado',                  category: 'Produce', unit: 'each',serving: 1, prices: { wholefoods: 2.5, costco: 1.4 } },
    { id: 'sweetpot',  name: 'Sweet Potato',             category: 'Produce', unit: 'lb',  serving: 0.4, prices: { wholefoods: 2.5, costco: 1.6 } },
    { id: 'broccoli',  name: 'Broccoli',                 category: 'Produce', unit: 'lb',  serving: 0.5, prices: { wholefoods: 3,   costco: 2 } },
    { id: 'asparagus', name: 'Asparagus',                category: 'Produce', unit: 'lb',  serving: 0.5, prices: { wholefoods: 5,   costco: 3.5 } },
    { id: 'arugula',   name: 'Wild Arugula',             category: 'Produce', unit: 'bag', serving: 0.5, prices: { wholefoods: 4.5, costco: 3.2 } },
    { id: 'spinach',   name: 'Organic Spinach',          category: 'Produce', unit: 'bag', serving: 0.5, prices: { wholefoods: 5,   costco: 3.5 } },
    { id: 'berries',   name: 'Wild Blueberries (frozen)',category: 'Produce', unit: 'bag', serving: 0.25, prices: { wholefoods: 8, costco: 5 } },
    { id: 'lemons',    name: 'Lemons',                   category: 'Produce', unit: 'each',serving: 0.5, prices: { wholefoods: 0.8, costco: 0.5 } },
    { id: 'onions',    name: 'Yellow Onions',            category: 'Produce', unit: 'lb',  serving: 0.25, prices: { wholefoods: 2,  costco: 1.2 } },
    { id: 'garlic',    name: 'Garlic',                   category: 'Produce', unit: 'head',serving: 0.2, prices: { wholefoods: 1.2, costco: 0.7 } },
    // fats & dairy
    { id: 'butter',    name: 'Grass-fed Butter',         category: 'Fats / Dairy', unit: 'lb', serving: 0.05, prices: { wholefoods: 9, costco: 6 } },
    { id: 'ghee',      name: 'Grass-fed Ghee',           category: 'Fats / Dairy', unit: 'jar', serving: 0.05, prices: { wholefoods: 15, costco: 11 } },
    { id: 'olive',     name: 'EVOO (single-origin)',     category: 'Fats / Dairy', unit: 'liter', serving: 0.03, prices: { wholefoods: 30, costco: 20 } },
    { id: 'yogurt',    name: 'Grass-fed Whole Yogurt',   category: 'Fats / Dairy', unit: 'quart', serving: 0.25, prices: { wholefoods: 9, costco: 6 } },
    // pantry
    { id: 'salt',      name: 'Unrefined Sea Salt',       category: 'Pantry', unit: 'lb',  serving: 0.02, prices: { wholefoods: 8, costco: 5 } },
    { id: 'broth',     name: 'Bone Broth (quart)',       category: 'Pantry', unit: 'quart',serving: 0.5, prices: { wholefoods: 9, costco: 6 } },
    { id: 'honey',     name: 'Raw Local Honey',          category: 'Pantry', unit: 'jar', serving: 0.05, prices: { wholefoods: 14, costco: 9 } },
    { id: 'sourdough', name: 'True Sourdough Loaf',      category: 'Pantry', unit: 'loaf',serving: 0.15, prices: { wholefoods: 7, costco: 5 } },
    { id: 'pumpkin',   name: 'Pumpkin Seeds',            category: 'Pantry', unit: 'lb',  serving: 0.05, prices: { wholefoods: 9, costco: 6 } },
  ];

  // Default weekly servings — what a primal whole-food week looks like.
  const DEFAULT_SERVINGS = {
    ribeye: 2, ground: 4, salmon: 2, eggs: 14, chicken: 4, liver: 1, sardines: 3,
    avocado: 7, sweetpot: 5, broccoli: 4, asparagus: 3, arugula: 4, spinach: 5,
    berries: 5, lemons: 4, onions: 3, garlic: 2,
    butter: 7, ghee: 3, olive: 7, yogurt: 4,
    salt: 3, broth: 4, honey: 2, sourdough: 2, pumpkin: 3,
  };

  function buildGroceryList(source, servings) {
    let total = 0;
    const lines = FOOD_CATALOG.map(item => {
      const s = servings[item.id] ?? 0;
      const qty = s * item.serving;
      const cost = qty * (item.prices[source] || 0);
      total += cost;
      return { ...item, servings: s, qty, cost };
    }).filter(l => l.servings > 0);
    return { lines, total };
  }

  // ---------- Public API ----------
  window.DialedUI = {
    fmtMoney, fmtDate, fmtTime, fmtDateLong, initials, escapeHtml,
    activateTabs, solarTimes, circadianSchedule,
    buildDetoxProtocol, DETOX_PROTOCOLS,
    FOOD_CATALOG, DEFAULT_SERVINGS, buildGroceryList,
  };
})();
