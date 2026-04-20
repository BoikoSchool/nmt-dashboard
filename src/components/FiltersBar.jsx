import { Filter, X } from "lucide-react";

export default function FiltersBar({
  classes,
  selectedClasses,
  onToggleClass,
  onResetClasses,
  studentCountByClass,
  totalStudents,
}) {
  if (!classes || classes.length <= 1) return null;

  const hasFilter = selectedClasses.size > 0;

  return (
    <div className="sticky top-[57px] z-10 bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-stone-500 shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Класи:</span>
      </div>

      {/* "Усі" chip */}
      <button
        onClick={onResetClasses}
        className={[
          "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
          !hasFilter
            ? "bg-emerald-700 text-white border-emerald-700"
            : "bg-white text-stone-600 border-stone-300 hover:border-emerald-400",
        ].join(" ")}
      >
        Усі ({totalStudents})
      </button>

      {/* Per-class chips */}
      {classes.map((cls) => {
        const active = selectedClasses.has(cls);
        const count = studentCountByClass.get(cls) ?? 0;
        return (
          <button
            key={cls}
            onClick={() => onToggleClass(cls)}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              active
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-stone-600 border-stone-300 hover:border-emerald-400",
            ].join(" ")}
          >
            {cls} ({count})
          </button>
        );
      })}

      {/* Reset button */}
      {hasFilter && (
        <button
          onClick={onResetClasses}
          className="ml-auto flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Скинути фільтр
        </button>
      )}
    </div>
  );
}
