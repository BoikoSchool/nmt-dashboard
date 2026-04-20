export default function Kpi({ label, value, sub, valueClass = "text-stone-800" }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-4 flex flex-col gap-1 min-w-0">
      <p className="text-xs text-stone-500 font-medium uppercase tracking-wide truncate">
        {label}
      </p>
      <p className={`text-2xl font-serif font-bold tabular-nums leading-tight ${valueClass}`}>
        {value ?? "—"}
      </p>
      {sub && (
        <p className="text-xs text-stone-400 truncate">{sub}</p>
      )}
    </div>
  );
}
