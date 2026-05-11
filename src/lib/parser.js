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
    .replace(/!\[Image\]\([^)]+\)/g, " [зображення]")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\d?frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\operatorname\{([^}]+)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function shortQuestion(text) {
  const cleaned = cleanQuestion(text);
  return cleaned.length > 160 ? cleaned.slice(0, 160) + "…" : cleaned;
}
