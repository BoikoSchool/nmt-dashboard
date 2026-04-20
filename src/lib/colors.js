// NMT score badge — bg + text classes
export function scoreBadgeClass(nmt) {
  if (nmt >= 180) return "bg-emerald-800 text-white";
  if (nmt >= 160) return "bg-emerald-100 text-emerald-900";
  if (nmt >= 140) return "bg-yellow-100 text-yellow-900";
  if (nmt >= 120) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

// KPI value color (text only)
export function nmtColor(nmt) {
  if (nmt >= 160) return "text-emerald-700";
  if (nmt >= 140) return "text-yellow-600";
  return "text-red-600";
}

export function accuracyColor(pct) {
  if (pct >= 0.8) return "text-emerald-700";
  if (pct >= 0.7) return "text-yellow-600";
  return "text-red-600";
}

// Progress bar fill color
export function accuracyBarClass(pct) {
  if (pct >= 0.8) return "bg-emerald-500";
  if (pct >= 0.7) return "bg-yellow-400";
  return "bg-red-400";
}
