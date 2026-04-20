import { useState, useMemo } from "react";
import { shortQuestion } from "../lib/parser.js";
import { accuracyColor } from "../lib/colors.js";
import QuestionDetailModal from "./QuestionDetailModal.jsx";

const TYPE_LABEL = {
  single_choice: "одна відповідь",
  matching:      "відповідність",
  short_answer:  "коротка відповідь",
};

export default function QuestionsTab({ questions }) {
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.accuracy - b.accuracy || b.total - a.total),
    [questions]
  );

  if (sorted.length === 0) {
    return (
      <div className="py-16 text-center text-stone-400 text-sm">
        Немає даних для поточного фільтру
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sorted.map((q, i) => (
          <QuestionCard key={i} q={q} rank={i + 1} onClick={() => setSelected(q)} />
        ))}
      </div>

      {selected && (
        <QuestionDetailModal question={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({ q, rank, onClick }) {
  const pct       = Math.round(q.accuracy * 100);
  const colorText = accuracyColor(q.accuracy);
  const preview   = shortQuestion(q.question);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-stone-200 rounded-xl shadow-sm px-5 py-4 flex gap-4 items-start hover:border-emerald-300 hover:shadow transition-all"
    >
      {/* Left: big % */}
      <div className="shrink-0 w-16 text-center">
        <p className={`text-3xl font-serif font-bold tabular-nums leading-none ${colorText}`}>
          {pct}%
        </p>
        <p className="text-xs text-stone-400 mt-1 tabular-nums">
          {q.correct}/{q.total}
        </p>
      </div>

      {/* Center: text + badges */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 leading-snug line-clamp-3">{preview}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge>{q.subjectShort}</Badge>
          {q.type && <Badge dim>{TYPE_LABEL[q.type] ?? q.type}</Badge>}
        </div>
      </div>

      {/* Right: horizontal progress bar */}
      <div className="shrink-0 w-24 flex items-center self-center">
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor(q.accuracy)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function Badge({ children, dim }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      dim
        ? "bg-stone-100 text-stone-500"
        : "bg-emerald-50 text-emerald-700"
    }`}>
      {children}
    </span>
  );
}

function barColor(pct) {
  if (pct >= 0.8) return "bg-emerald-500";
  if (pct >= 0.5) return "bg-yellow-400";
  return "bg-red-400";
}
