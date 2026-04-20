import { useState, useMemo, Fragment } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Info } from "lucide-react";
import { scoreBadgeClass } from "../lib/colors.js";
import { shortSubject } from "../lib/parser.js";
import StudentDetailModal from "./StudentDetailModal.jsx";

// sticky left offsets (px)
const L_RANK = 0;
const L_NAME = 36;

export default function MatrixTab({ students, subjects, hasClasses, activeSubject }) {
  const [sort, setSort]   = useState({ key: "name", dir: "asc" });
  const [selected, setSelected] = useState(null);

  // Map<studentId, Map<subject, block>>
  const blockLookup = useMemo(() => {
    const map = new Map();
    for (const s of students) {
      const sm = new Map();
      for (const b of s.blocks) sm.set(b.subject, b);
      map.set(s.studentId, sm);
    }
    return map;
  }, [students]);

  const sorted = useMemo(() => {
    const arr = [...students];
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (key === "name")
        return mul * a.studentName.localeCompare(b.studentName, "uk");

      // key format: "nmt:Subject_code" or "raw:Subject_code"
      const colon   = key.indexOf(":");
      const type    = key.slice(0, colon);        // "nmt" | "raw"
      const subject = key.slice(colon + 1);

      const ba = blockLookup.get(a.studentId)?.get(subject);
      const bb = blockLookup.get(b.studentId)?.get(subject);

      // no block → always to bottom, regardless of sort direction
      if (!ba && !bb) return 0;
      if (!ba) return 1;
      if (!bb) return -1;

      const va = type === "nmt" ? ba.totalNmt : ba.blockRaw;
      const vb = type === "nmt" ? bb.totalNmt : bb.blockRaw;
      return mul * (va - vb);
    });

    return arr;
  }, [students, sort, blockLookup]);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );

  return (
    <>
      {/* Subject-filter-ignored hint */}
      {activeSubject && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Журнал завжди показує всі предмети — фільтр предметів у шапці тут не застосовується.
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">

            {/* ── Header ── */}
            <thead>
              <tr className="border-b-2 border-stone-200">

                {/* # — sticky top + left */}
                <Th sticky="both" left={L_RANK} width={36} className="text-center">
                  #
                </Th>

                {/* Учень — sticky top + left */}
                <Th sticky="both" left={L_NAME} minWidth={172} className="text-left">
                  Учень
                </Th>

                {/* Клас */}
                {hasClasses && (
                  <Th sticky="top" minWidth={88} className="text-left">Клас</Th>
                )}

                {/* Subject pairs */}
                {subjects.map((subj, si) => (
                  <Fragment key={subj}>
                    <Th
                      sticky="top"
                      minWidth={78}
                      className={`text-center cursor-pointer hover:bg-stone-100 ${si > 0 ? "border-l-2 border-stone-200" : ""}`}
                      onClick={() => toggleSort(`nmt:${subj}`)}
                    >
                      <span className="inline-flex items-center gap-0.5 justify-center">
                        {shortSubject(subj)}&nbsp;(шк)
                        <SortIcon sortKey={`nmt:${subj}`} sort={sort} />
                      </span>
                    </Th>
                    <Th
                      sticky="top"
                      minWidth={58}
                      className="text-center cursor-pointer hover:bg-stone-100"
                      onClick={() => toggleSort(`raw:${subj}`)}
                    >
                      <span className="inline-flex items-center gap-0.5 justify-center">
                        (бал)
                        <SortIcon sortKey={`raw:${subj}`} sort={sort} />
                      </span>
                    </Th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody className="divide-y divide-stone-100">
              {sorted.map((student, idx) => {
                const subjectMap = blockLookup.get(student.studentId);
                return (
                  <tr
                    key={student.studentId}
                    onClick={() => setSelected(student)}
                    className="group cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    {/* # */}
                    <Td sticky left={L_RANK} width={36}
                      className="text-center text-xs text-stone-400 tabular-nums">
                      {idx + 1}
                    </Td>

                    {/* Учень */}
                    <Td sticky left={L_NAME} minWidth={172}
                      className="font-medium text-stone-800 whitespace-nowrap">
                      {student.studentName}
                    </Td>

                    {/* Клас */}
                    {hasClasses && (
                      <td className="px-3 py-2.5">
                        {student.className && (
                          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full whitespace-nowrap">
                            {student.className}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Subject cells */}
                    {subjects.map((subj, si) => {
                      const block = subjectMap?.get(subj);
                      return (
                        <Fragment key={subj}>
                          {/* Scaled NMT */}
                          <td className={`px-2 py-2.5 text-center ${si > 0 ? "border-l-2 border-stone-100" : ""}`}>
                            {block
                              ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${scoreBadgeClass(block.totalNmt)}`}>
                                  {block.totalNmt}
                                </span>
                              : <Dash />
                            }
                          </td>
                          {/* Raw */}
                          <td className="px-2 py-2.5 text-center tabular-nums text-stone-600">
                            {block ? block.blockRaw : <Dash />}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-stone-400 mt-2 text-center">
        Фільтр предметів у шапці в журналі не застосовується — тут завжди видно всі предмети.
      </p>

      {selected && (
        <StudentDetailModal student={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SortIcon({ sortKey, sort }) {
  const active = sortKey != null && sort.key === sortKey;
  const Icon   = active
    ? sort.dir === "asc" ? ChevronUp : ChevronDown
    : ChevronsUpDown;
  return <Icon className={`w-3 h-3 shrink-0 ${active ? "text-emerald-600" : "text-stone-300"}`} />;
}

function Dash() {
  return <span className="text-stone-300 select-none">—</span>;
}

// Header cell: sticky="top" | "both"
function Th({ sticky, left, minWidth, width, className = "", onClick, children }) {
  const isLeft = sticky === "both";
  const zClass = isLeft ? "z-30" : "z-20";
  return (
    <th
      style={{ left: isLeft ? left : undefined, minWidth, width }}
      onClick={onClick}
      className={[
        "sticky top-0 bg-stone-50 px-2 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap transition-colors",
        isLeft ? `${zClass}` : zClass,
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

// Body cell: sticky left
function Td({ sticky, left, minWidth, width, className = "", children }) {
  if (!sticky) return null; // not used as non-sticky; kept for symmetry
  return (
    <td
      style={{ left, minWidth, width }}
      className={[
        "sticky z-10 px-3 py-2.5",
        "bg-white group-hover:bg-stone-50 transition-colors",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}
