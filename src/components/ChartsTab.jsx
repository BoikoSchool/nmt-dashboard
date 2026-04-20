import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

// ── colour helpers ────────────────────────────────────────────────────────────

function nmtBinFill(min) {
  if (min >= 180) return "#047857";
  if (min >= 160) return "#34d399";
  if (min >= 140) return "#facc15";
  if (min >= 120) return "#fb923c";
  return "#f87171";
}

function nmtBarBg(nmt) {
  if (nmt >= 180) return "bg-emerald-700";
  if (nmt >= 160) return "bg-emerald-400";
  if (nmt >= 140) return "bg-yellow-400";
  if (nmt >= 120) return "bg-orange-400";
  return "bg-red-400";
}

const BINS = [
  { label: "100–119", min: 100, max: 119 },
  { label: "120–139", min: 120, max: 139 },
  { label: "140–159", min: 140, max: 159 },
  { label: "160–179", min: 160, max: 179 },
  { label: "180–200", min: 180, max: 200 },
];

// ── main component ────────────────────────────────────────────────────────────

export default function ChartsTab({ filtered, hasClasses }) {
  const { students, blocks } = filtered;

  // 1. histogram data
  const histData = useMemo(
    () =>
      BINS.map((bin) => ({
        label: bin.label,
        count: students.filter((s) => s.totalNmt >= bin.min && s.totalNmt <= bin.max).length,
        fill:  nmtBinFill(bin.min),
      })),
    [students]
  );

  // 2. scatter data — one dot per block (one student's work in one subject)
  const scatterData = useMemo(
    () =>
      blocks
        .filter((b) => b.durationMin != null && b.durationMin > 0)
        .map((b) => ({
          duration: b.durationMin,
          nmt:      b.totalNmt,
          name:     b.studentName,
          subject:  b.subjectShort,
        })),
    [blocks]
  );

  // 3. class comparison — only when >1 class visible
  const classData = useMemo(() => {
    const map = new Map();
    for (const s of students) {
      const cls = s.className || "—";
      if (!map.has(cls)) map.set(cls, { students: [], blocks: [] });
      map.get(cls).students.push(s);
    }
    for (const b of blocks) {
      const cls = b.className || "—";
      if (map.has(cls)) map.get(cls).blocks.push(b);
    }
    return [...map.entries()]
      .map(([cls, { students: ss, blocks: bs }]) => {
        const avgNmt   = Math.round(ss.reduce((a, s) => a + s.totalNmt, 0) / ss.length);
        const totalQ   = bs.reduce((a, b) => a + b.totalQ, 0);
        const correctQ = bs.reduce((a, b) => a + b.correctQ, 0);
        return {
          cls,
          avgNmt,
          studentCount: ss.length,
          worksCount:   bs.length,
          accuracy:     totalQ > 0 ? Math.round(correctQ / totalQ * 100) : 0,
        };
      })
      .sort((a, b) => b.avgNmt - a.avgNmt);
  }, [students, blocks]);

  const showClasses = hasClasses && classData.length > 1;

  // 4. subject averages
  const subjectData = useMemo(() => {
    const map = new Map();
    for (const b of blocks) {
      if (!map.has(b.subject))
        map.set(b.subject, { label: b.subjectShort, nmts: [] });
      map.get(b.subject).nmts.push(b.totalNmt);
    }
    return [...map.values()]
      .map(({ label, nmts }) => ({
        label,
        avgNmt: Math.round(nmts.reduce((a, v) => a + v, 0) / nmts.length),
        count:  nmts.length,
      }))
      .sort((a, b) => b.avgNmt - a.avgNmt);
  }, [blocks]);

  if (students.length === 0) {
    return (
      <div className="py-16 text-center text-stone-400 text-sm">
        Немає даних для поточного фільтру
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Row 1: histogram + scatter ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Histogram */}
        <ChartCard title="Розподіл за шкальним балом NMT">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716c" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#78716c" }} />
              <Tooltip
                cursor={{ fill: "#f5f5f4" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const { label, count } = payload[0].payload;
                  return (
                    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow">
                      <p className="font-semibold text-stone-700">{label}</p>
                      <p className="text-stone-500">{count} учнів</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter */}
        <ChartCard title="Тривалість vs шкальний бал">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="duration" name="хв" type="number"
                  label={{ value: "хв", position: "insideBottomRight", offset: -4, fontSize: 10, fill: "#a8a29e" }}
                  tick={{ fontSize: 11, fill: "#78716c" }}
                />
                <YAxis
                  dataKey="nmt" name="NMT" type="number" domain={[100, 200]}
                  tick={{ fontSize: 11, fill: "#78716c" }}
                />
                <ZAxis range={[32, 32]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow">
                        <p className="font-semibold text-stone-700">{d.name}</p>
                        <p className="text-stone-500">{d.subject} · {d.nmt} NMT · {d.duration} хв</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#059669" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="Немає даних про тривалість" />
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: class comparison ─────────────────────────────────────────── */}
      {showClasses && (
        <ChartCard title="Порівняння класів">
          <div className="space-y-3 pt-1">
            {classData.map((c) => (
              <HBar
                key={c.cls}
                label={c.cls}
                value={c.avgNmt}
                meta={`${c.studentCount} учнів · ${c.worksCount} робіт · ${c.accuracy}% правильних`}
              />
            ))}
          </div>
        </ChartCard>
      )}

      {/* ── Row 3: subject averages ─────────────────────────────────────────── */}
      <ChartCard title="Середній бал за предметами">
        <div className="space-y-3 pt-1">
          {subjectData.map((s) => (
            <HBar
              key={s.label}
              label={s.label}
              value={s.avgNmt}
              meta={`${s.count} робіт`}
            />
          ))}
        </div>
      </ChartCard>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function HBar({ label, value, meta }) {
  const pct = ((value - 100) / 100) * 100;   // 100 NMT → 0%, 200 NMT → 100%
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium text-stone-700 truncate shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${nmtBarBg(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-sm font-bold tabular-nums text-stone-800 text-right shrink-0">
        {value}
      </span>
      {meta && (
        <span className="text-xs text-stone-400 shrink-0 hidden sm:inline">{meta}</span>
      )}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-stone-400 text-sm">
      {text}
    </div>
  );
}
