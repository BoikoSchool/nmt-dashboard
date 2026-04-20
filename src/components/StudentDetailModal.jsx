import { useState, useEffect } from "react";
import { X, ChevronRight, CheckCircle2, XCircle, Clock, BookOpen } from "lucide-react";
import { scoreBadgeClass } from "../lib/colors.js";
import { shortQuestion } from "../lib/parser.js";

export default function StudentDetailModal({ student, onClose }) {
  const [openBlocks, setOpenBlocks] = useState(new Set());

  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleBlock = (key) =>
    setOpenBlocks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // overall stats (not filtered — full profile)
  const totalQ   = student.totalQ;
  const correctQ = student.correctQ;
  const accuracy = Math.round(student.accuracy * 100);

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-6"
        onMouseDown={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>

          <h2 className="font-serif text-2xl font-bold text-stone-800 leading-tight pr-8">
            {student.studentName}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {student.className && (
              <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">
                {student.className}
              </span>
            )}
            <span className="text-sm text-stone-400">{student.studentId}</span>
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-stone-100">
          <MiniKpi label="NMT"          value={student.totalNmt}
            valueClass={scoreBadgeClass(student.totalNmt).replace("bg-", "text-").replace(" text-white", " text-emerald-800").replace("text-emerald-900","text-emerald-700")} />
          <MiniKpi label="Raw"          value={student.totalRaw} />
          <MiniKpi label="% правильних" value={`${accuracy}%`} />
          <MiniKpi label="Питань"       value={`${correctQ}/${totalQ}`} />
        </div>

        {/* ── Accordion blocks ── */}
        <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {student.blocks.map((block) => {
            const key    = block.subject;
            const isOpen = openBlocks.has(key);
            return (
              <div key={key} className="border border-stone-200 rounded-xl overflow-hidden">

                {/* Block header */}
                <button
                  onClick={() => toggleBlock(key)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-white hover:bg-stone-50 transition-colors text-left"
                >
                  <ChevronRight className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="flex-1 font-medium text-sm text-stone-700 truncate">
                    {block.subject.split("_")[0]}
                  </span>
                  <span className="text-xs text-stone-500 shrink-0">
                    {block.correctQ}/{block.totalQ} прав.
                  </span>
                  {block.durationMin != null && (
                    <span className="flex items-center gap-0.5 text-xs text-stone-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      {block.durationMin} хв
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 ${scoreBadgeClass(block.totalNmt)}`}>
                    {block.totalNmt}
                  </span>
                  <span className="text-xs text-stone-400 shrink-0 tabular-nums">
                    Raw {block.blockRaw}
                  </span>
                </button>

                {/* Block body */}
                {isOpen && (
                  <div className="border-t border-stone-100 divide-y divide-stone-50 bg-stone-50/50">
                    {block.rows.map((row, i) => (
                      <QuestionRow key={i} row={row} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MiniKpi({ label, value, valueClass = "text-stone-800" }) {
  return (
    <div className="text-center">
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className={`text-lg font-serif font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

function QuestionRow({ row }) {
  const isCorrect = row.points > 0;
  return (
    <div className={`flex gap-3 px-4 py-3 ${isCorrect ? "" : "bg-red-50/50"}`}>
      {isCorrect
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        : <XCircle     className="w-4 h-4 text-red-400   shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 leading-snug">{shortQuestion(row.question)}</p>
        <div className="flex flex-wrap gap-3 mt-1">
          <span className="text-xs text-stone-400">{typeLabel(row.type)}</span>
          <span className="text-xs text-stone-400 tabular-nums">{row.points} б.</span>
          {!isCorrect && row.correctAnswer && (
            <span className="text-xs text-red-600">
              Правильно: <span className="font-medium">{row.correctAnswer}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function typeLabel(type) {
  if (type === "single_choice") return "одна відповідь";
  if (type === "matching")      return "відповідність";
  if (type === "short_answer")  return "коротка відповідь";
  return type;
}
