import { useMemo } from "react";
import Kpi from "./Kpi.jsx";
import { nmtColor, accuracyColor } from "../lib/colors.js";

export default function KpiRow({ filtered }) {
  const kpis = useMemo(() => {
    const { blocks, students, questions } = filtered;

    const studentCount = students.length;
    const worksCount = blocks.length;

    const avgNmt =
      students.length > 0
        ? Math.round(students.reduce((s, st) => s + st.totalNmt, 0) / students.length)
        : null;

    const totalQ = blocks.reduce((s, b) => s + b.totalQ, 0);
    const correctQ = blocks.reduce((s, b) => s + b.correctQ, 0);
    const accuracy = totalQ > 0 ? correctQ / totalQ : null;

    const durations = blocks
      .map((b) => b.durationMin)
      .filter((d) => d != null && d > 0);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, d) => a + d, 0) / durations.length)
        : null;

    const hardestAccuracy =
      questions.length > 0 ? Math.min(...questions.map((q) => q.accuracy)) : null;

    return { studentCount, worksCount, avgNmt, accuracy, avgDuration, hardestAccuracy };
  }, [filtered]);

  const { studentCount, worksCount, avgNmt, accuracy, avgDuration, hardestAccuracy } = kpis;

  return (
    <div className="grid grid-cols-5 gap-3 px-4 py-3">
      <Kpi
        label="Учнів"
        value={studentCount}
        sub={`${worksCount} виконаних робіт`}
      />
      <Kpi
        label="Середній NMT"
        value={avgNmt}
        sub="за шкалою 100–200"
        valueClass={avgNmt != null ? nmtColor(avgNmt) : "text-stone-400"}
      />
      <Kpi
        label="Середня точність"
        value={accuracy != null ? `${Math.round(accuracy * 100)}%` : null}
        sub="правильних відповідей"
        valueClass={accuracy != null ? accuracyColor(accuracy) : "text-stone-400"}
      />
      <Kpi
        label="Середня тривалість"
        value={avgDuration != null ? `${avgDuration} хв` : null}
        sub="на один блок"
      />
      <Kpi
        label="Найскладніше"
        value={hardestAccuracy != null ? `${Math.round(hardestAccuracy * 100)}%` : null}
        sub="мін. % правильних"
        valueClass={hardestAccuracy != null ? accuracyColor(hardestAccuracy) : "text-stone-400"}
      />
    </div>
  );
}
