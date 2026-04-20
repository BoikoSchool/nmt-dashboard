import { useState, useMemo, useRef, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import FiltersBar from "./FiltersBar.jsx";
import KpiRow from "./KpiRow.jsx";
import StudentsTab from "./StudentsTab.jsx";
import MatrixTab from "./MatrixTab.jsx";
import QuestionsTab from "./QuestionsTab.jsx";
import ChartsTab from "./ChartsTab.jsx";
import { shortSubject } from "../lib/parser.js";

const TABS = [
  { id: "students", label: "Учні" },
  { id: "matrix",   label: "Журнал" },
  { id: "questions",label: "Питання" },
  { id: "charts",   label: "Графіки" },
];

export default function Dashboard({ data, fileState, onReplace }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState(new Set());
  const [activeTab, setActiveTab] = useState("students");
  const replaceInputRef = useRef(null);

  // ── filtered dataset ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const blocks = data.blocks.filter(
      (b) =>
        (!activeSubject || b.subject === activeSubject) &&
        (selectedClasses.size === 0 || selectedClasses.has(b.className))
    );

    const studentIds = new Set(blocks.map((b) => b.studentId));

    // per-student filtered stats (accuracy + raw over filtered blocks only)
    const statsMap = new Map();
    for (const b of blocks) {
      if (!statsMap.has(b.studentId))
        statsMap.set(b.studentId, { correctQ: 0, totalQ: 0, raw: 0 });
      const s = statsMap.get(b.studentId);
      s.correctQ += b.correctQ;
      s.totalQ   += b.totalQ;
      s.raw      += b.blockRaw;
    }

    const students = data.students
      .filter((s) => studentIds.has(s.studentId))
      .map((s) => {
        const st = statsMap.get(s.studentId) || { correctQ: 0, totalQ: 0, raw: 0 };
        return {
          ...s,
          filteredCorrectQ: st.correctQ,
          filteredTotalQ:   st.totalQ,
          filteredRaw:      st.raw,
          filteredAccuracy: st.totalQ > 0 ? st.correctQ / st.totalQ : 0,
        };
      });

    const questions = data.questions
      .filter((q) => !activeSubject || q.subject === activeSubject)
      .map((q) => {
        if (selectedClasses.size === 0) return q;
        const ans     = q.answers.filter((a) => selectedClasses.has(a.className));
        const total   = ans.length;
        const correct = ans.filter((a) => a.isCorrect).length;
        return { ...q, answers: ans, total, correct, accuracy: total > 0 ? correct / total : 0 };
      })
      .filter((q) => q.total > 0);

    return { blocks, students, questions };
  }, [data, activeSubject, selectedClasses]);

  // ── matrix: class-filtered only (subject filter ignored per spec) ────────
  const matrixStudents = useMemo(
    () =>
      selectedClasses.size === 0
        ? data.students
        : data.students.filter((s) => selectedClasses.has(s.className)),
    [data, selectedClasses]
  );

  // ── class chip counts ─────────────────────────────────────────────────────
  const studentCountByClass = useMemo(() => {
    const relevantIds = activeSubject
      ? new Set(data.blocks.filter((b) => b.subject === activeSubject).map((b) => b.studentId))
      : new Set(data.students.map((s) => s.studentId));
    const map = new Map();
    for (const s of data.students)
      if (relevantIds.has(s.studentId))
        map.set(s.className, (map.get(s.className) || 0) + 1);
    return map;
  }, [data, activeSubject]);

  const totalStudentsForFilter = useMemo(
    () => [...studentCountByClass.values()].reduce((a, b) => a + b, 0),
    [studentCountByClass]
  );

  // ── handlers ──────────────────────────────────────────────────────────────
  const toggleClass = useCallback((cls) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      next.has(cls) ? next.delete(cls) : next.add(cls);
      return next;
    });
  }, []);

  const resetClasses  = useCallback(() => setSelectedClasses(new Set()), []);
  const handleSubject = useCallback((subj) => {
    setActiveSubject(subj);
    setSelectedClasses(new Set());
  }, []);

  const loadedLabel = fileState.loadedAt.toLocaleTimeString("uk", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="font-serif font-bold text-emerald-700 text-lg shrink-0">
            НМТ Аналітика
          </span>
          <span className="hidden sm:block text-xs text-stone-400 truncate max-w-[180px]">
            {fileState.fileName} · {loadedLabel}
          </span>

          <nav className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 py-1 scrollbar-none">
            <SubjectTab label="Усі предмети" active={activeSubject === null}
              onClick={() => handleSubject(null)} />
            {data.subjects.map((subj) => (
              <SubjectTab key={subj} label={shortSubject(subj)}
                active={activeSubject === subj} onClick={() => handleSubject(subj)} />
            ))}
          </nav>

          <button onClick={() => replaceInputRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-300 hover:border-stone-400 rounded-lg px-3 py-1.5 transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Замінити файл</span>
          </button>
          <input ref={replaceInputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => onReplace(e.target.files[0])} />
        </div>
      </header>

      {/* ── Class filters ───────────────────────────────────────────────────── */}
      {data.hasClasses && (
        <FiltersBar classes={data.classes} selectedClasses={selectedClasses}
          onToggleClass={toggleClass} onResetClasses={resetClasses}
          studentCountByClass={studentCountByClass} totalStudents={totalStudentsForFilter} />
      )}

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <KpiRow filtered={filtered} />

      {/* ── Content tabs ────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 pb-10">
        {/* Tab strip */}
        <div className="flex gap-1 border-b border-stone-200 mb-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === t.id
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-stone-500 hover:text-stone-700",
              ].join(" ")}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "students"  && (
          <StudentsTab students={filtered.students} hasClasses={data.hasClasses} />
        )}
        {activeTab === "matrix" && (
          <MatrixTab
            students={matrixStudents}
            subjects={data.subjects}
            hasClasses={data.hasClasses}
            activeSubject={activeSubject}
          />
        )}
        {activeTab === "questions" && <QuestionsTab questions={filtered.questions} />}
        {activeTab === "charts" && (
          <ChartsTab filtered={filtered} hasClasses={data.hasClasses} />
        )}
      </div>
    </div>
  );
}

function SubjectTab({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={[
        "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
        active ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100",
      ].join(" ")}>
      {label}
    </button>
  );
}
