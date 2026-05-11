export const SUBJECT_SHORT_MAP = [
  [/математик/i, "Мат."],
  [/українськ.*мов/i, "Укр.м"],
  [/історі|history/i, "Іст."],
  [/english|англ/i, "Англ."],
  [/біолог/i, "Біол."],
  [/географ/i, "Геог."],
  [/хімі/i, "Хім."],
  [/фізик/i, "Фіз."],
];

const SUBJECT_ORDER = [
  /математик/i,
  /українськ.*мов/i,
  /історі|history/i,
  /english|англ/i,
  /біолог/i,
  /географ/i,
  /хімі/i,
  /фізик/i,
];

// Parses "DD.MM.YYYY, HH:MM:SS" → Date
export function parseDate(str) {
  if (!str) return null;
  const m = str.match(/(\d{2})\.(\d{2})\.(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]);
}

export function num(val) {
  if (val === "" || val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export function shortSubject(subject) {
  const base = subject.split("_")[0].trim();
  for (const [re, short] of SUBJECT_SHORT_MAP) {
    if (re.test(base)) return short;
  }
  return base;
}

export function subjectOrder(subject) {
  const base = subject.split("_")[0].trim();
  const idx = SUBJECT_ORDER.findIndex((re) => re.test(base));
  return idx === -1 ? 999 : idx;
}

export function cleanQuestion(text) {
  if (!text) return "";
  return text
    // images
    .replace(/!\[Image\]\([^)]+\)/g, " [зображення]")
    // strip $...$ wrappers
    .replace(/\$\$([^$]+)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    // sqrt with index: \sqrt[n]{x} → n√(x)
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, "$1√($2)")
    // sqrt without index: \sqrt{x} → √(x)
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    // fractions: \frac{a}{b} and \dfrac{a}{b} → (a)/(b)
    .replace(/\\d?frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    // operatorname
    .replace(/\\operatorname\{([^}]+)\}/g, "$1")
    // environments
    .replace(/\\begin\{[^}]+\}/g, "")
    .replace(/\\end\{[^}]+\}/g, "")
    // \left / \right → strip (keep the bracket that follows)
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    // double backslash (LaTeX line break) → space
    .replace(/\\\\/g, " ")
    // Greek letters
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g,  "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g,"λ")
    .replace(/\\mu/g,    "μ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\phi/g,   "φ")
    .replace(/\\omega/g, "ω")
    .replace(/\\pi/g,    "π")
    // math symbols
    .replace(/\\geqslant/g, "≥")
    .replace(/\\leqslant/g, "≤")
    .replace(/\\geq/g,  "≥")
    .replace(/\\leq/g,  "≤")
    .replace(/\\neq/g,  "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\times/g,  "×")
    .replace(/\\cdot/g,   "·")
    .replace(/\\pm/g,     "±")
    .replace(/\\cup/g,    "∪")
    .replace(/\\cap/g,    "∩")
    .replace(/\\infty/g,  "∞")
    // trig and log — keep as readable text
    .replace(/\\(cos|sin|tan|tg|ctg|lg|log)/g, "$1")
    // remaining LaTeX commands → remove
    .replace(/\\[a-zA-Z]+/g, "")
    // curly braces → remove
    .replace(/[{}]/g, "")
    // normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function shortQuestion(text) {
  const cleaned = cleanQuestion(text);
  return cleaned.length > 160 ? cleaned.slice(0, 160) + "…" : cleaned;
}
