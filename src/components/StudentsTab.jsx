import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { scoreBadgeClass, accuracyBarClass } from "../lib/colors.js";
import StudentDetailModal from "./StudentDetailModal.jsx";

export default function StudentsTab({ students, hasClasses }) {
  const [sort, setSort]   = useState({ key: "nmt", dir: "desc" });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // ── search ────────────────────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const searched = useMemo(
    () =>
      q
        ? students.filter(
            (s) =>
              s.studentName.toLowerCase().includes(q) ||
              s.studentId.toLowerCase().includes(q) ||
              s.className.toLowerCase().includes(q)
          )
        : students,
    [students, q]
  );

  // ── sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...searched];
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (key) {
        case "name":     return mul * a.studentName.localeCompare(b.studentName, "uk");
        case "class":    return mul * a.className.localeCompare(b.className, "uk");
        case "nmt":      return mul * (a.totalNmt - b.totalNmt);
        case "raw":      return mul * (a.filteredRaw - b.filteredRaw);
        case "accuracy": return mul * (a.filteredAccuracy - b.filteredAccuracy);
        default:         return 0;
      }
    });
    return arr;
  }, [searched, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };

  return (
    <>
      {/* Search */}
      <div className="relative mb-3 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за іменем, email, класом…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <Th className="w-10 pl-4">#</Th>
                <Th sortKey="name" sort={sort} onSort={toggleSort}>Учень</Th>
                {hasClasses && (
                  <Th sortKey="class" sort={sort} onSort={toggleSort}>Клас</Th>
                )}
                <Th sortKey="nmt" sort={sort} onSort={toggleSort} className="text-right">
                  Середній NMT
                </Th>
                <Th sortKey="raw" sort={sort} onSort={toggleSort} className="text-right">
                  Raw
                </Th>
                <Th sortKey="accuracy" sort={sort} onSort={toggleSort} className="w-44">
                  % правильних
                </Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.map((student, idx) => (
                <StudentRow
                  key={student.studentId}
                  rank={idx + 1}
                  student={student}
                  hasClasses={hasClasses}
                  onClick={() => setSelected(student)}
                />
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={hasClasses ? 6 : 5}
                    className="py-10 text-center text-stone-400 text-sm">
                    Нічого не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <StudentDetailModal student={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Th({ children, sortKey, sort, onSort, className = "" }) {
  const active = sortKey != null && sort?.key === sortKey;
  const Icon = active
    ? sort.dir === "asc" ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  return (
    <th
      className={[
        "px-3 py-2.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap",
        sortKey ? "cursor-pointer select-none hover:text-stone-700" : "",
        className,
      ].join(" ")}
      onClick={sortKey ? () => onSort(sortKey) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey && <Icon className={`w-3 h-3 ${active ? "text-emerald-600" : "text-stone-300"}`} />}
      </span>
    </th>
  );
}

function StudentRow({ rank, student, hasClasses, onClick }) {
  const pct = Math.round(student.filteredAccuracy * 100);

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-stone-50 transition-colors"
    >
      {/* # */}
      <td className="pl-4 pr-2 py-3 text-stone-400 tabular-nums text-xs w-10">
        {rank}
      </td>

      {/* Учень */}
      <td className="px-3 py-3">
        <p className="font-medium text-stone-800 leading-tight">{student.studentName}</p>
        <p className="text-xs text-stone-400 leading-tight mt-0.5">{student.studentId}</p>
      </td>

      {/* Клас */}
      {hasClasses && (
        <td className="px-3 py-3">
          {student.className && (
            <span className="inline-block px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">
              {student.className}
            </span>
          )}
        </td>
      )}

      {/* NMT badge */}
      <td className="px-3 py-3 text-right">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${scoreBadgeClass(student.totalNmt)}`}>
          {student.totalNmt}
        </span>
      </td>

      {/* Raw */}
      <td className="px-3 py-3 text-right tabular-nums text-stone-600 text-sm">
        {student.filteredRaw}
      </td>

      {/* % правильних + progress bar */}
      <td className="px-3 py-3 w-44">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${accuracyBarClass(student.filteredAccuracy)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-stone-600 w-8 text-right">{pct}%</span>
        </div>
      </td>
    </tr>
  );
}
