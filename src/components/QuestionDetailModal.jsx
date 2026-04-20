import { useEffect } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { cleanQuestion } from "../lib/parser.js";

const TYPE_LABEL = {
  single_choice: "одна відповідь",
  matching:      "відповідність",
  short_answer:  "коротка відповідь",
};

export default function QuestionDetailModal({ question, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = Math.round(question.accuracy * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              {question.subjectShort}
            </span>
          </div>
          <p className="text-sm text-stone-700 leading-snug pr-8">
            {cleanQuestion(question.question)}
          </p>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-stone-100">
          <MiniKpi label="% правильних"    value={`${pct}%`} />
          <MiniKpi label="Правильно / Всього" value={`${question.correct}/${question.total}`} />
          <MiniKpi label="Тип"             value={TYPE_LABEL[question.type] ?? question.type} small />
        </div>

        {/* ── Correct answer ── */}
        {question.correctAnswer && (
          <div className="mx-6 mt-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-xs font-semibold text-emerald-700 mb-0.5">Правильна відповідь</p>
            <p className="text-sm text-emerald-900">{cleanQuestion(question.correctAnswer)}</p>
          </div>
        )}

        {/* ── Answers list ── */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Відповіді учнів
          </p>
          {[...question.answers]
            .sort((a, b) => a.isCorrect - b.isCorrect)
            .map((a, i) => (
              <AnswerRow key={i} answer={a} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MiniKpi({ label, value, small }) {
  return (
    <div className="text-center">
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className={`font-serif font-bold text-stone-800 tabular-nums ${small ? "text-sm" : "text-lg"}`}>
        {value}
      </p>
    </div>
  );
}

function AnswerRow({ answer }) {
  return (
    <div className={`flex gap-3 items-start px-3 py-2.5 rounded-lg ${answer.isCorrect ? "bg-emerald-50/60" : "bg-red-50/50"}`}>
      {answer.isCorrect
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        : <XCircle      className="w-4 h-4 text-red-400   shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium text-stone-700">{answer.studentName}</span>
          {answer.className && (
            <span className="text-xs text-stone-400">{answer.className}</span>
          )}
        </div>
        <p className="text-xs text-stone-500 mt-0.5 break-words">{cleanQuestion(answer.studentAnswer) || "—"}</p>
      </div>
      <span className="text-xs tabular-nums text-stone-400 shrink-0">{answer.points} б.</span>
    </div>
  );
}
