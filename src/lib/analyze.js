import { parseDate, num, shortSubject, subjectOrder } from "./parser.js";

export function analyzeData(rows) {
  // --- normalize rows ---
  const normalized = rows.map((r) => ({
    studentId: (r["Email"] || "").trim(),
    studentName: (r["Студент"] || "").trim(),
    className: (r["Клас"] || "").trim(),
    subject: (r["Предмет (Блок)"] || "").trim(),
    start: parseDate(r["Початок"]),
    end: parseDate(r["Кінець"]),
    blockRaw: num(r["Бал за блок (Raw)"]),
    totalRaw: num(r["Загальний Raw"]),
    totalNmt: num(r["Загальний NMT"]),
    question: (r["Питання"] || "").trim(),
    type: (r["Тип"] || "").trim(),
    studentAnswer: (r["Відповідь студента"] || "").trim(),
    correctAnswer: (r["Правильна відповідь"] || "").trim(),
    points: num(r["Балів за питання"]),
  }));

  // --- subjects ---
  const subjectSet = new Set(normalized.map((r) => r.subject));
  const subjects = [...subjectSet].sort(
    (a, b) => subjectOrder(a) - subjectOrder(b) || a.localeCompare(b)
  );

  // --- classes ---
  const classSet = new Set(
    normalized.map((r) => r.className).filter(Boolean)
  );
  const classes = [...classSet].sort();
  const hasClasses = classes.length > 1;

  // --- blocks: aggregate per (studentId, subject) ---
  // Key: `${studentId}||${subject}`
  const blockMap = new Map();
  for (const r of normalized) {
    const key = `${r.studentId}||${r.subject}`;
    if (!blockMap.has(key)) {
      blockMap.set(key, {
        studentId: r.studentId,
        studentName: r.studentName,
        className: r.className,
        subject: r.subject,
        subjectShort: shortSubject(r.subject),
        blockRaw: r.blockRaw,
        totalRaw: r.totalRaw,
        totalNmt: r.totalNmt,
        start: r.start,
        end: r.end,
        rows: [],
      });
    }
    const b = blockMap.get(key);
    // take latest non-zero start/end (all rows in a block share the same)
    if (r.start) b.start = r.start;
    if (r.end) b.end = r.end;
    b.rows.push(r);
  }

  const blocks = [...blockMap.values()].map((b) => {
    const totalQ = b.rows.length;
    const correctQ = b.rows.filter((r) => r.points > 0).length;
    const durationMin =
      b.start && b.end
        ? Math.round((b.end - b.start) / 60000)
        : null;
    return {
      ...b,
      totalQ,
      correctQ,
      accuracy: totalQ > 0 ? correctQ / totalQ : 0,
      durationMin,
    };
  });

  // --- students: aggregate per studentId ---
  const studentMap = new Map();
  for (const b of blocks) {
    if (!studentMap.has(b.studentId)) {
      studentMap.set(b.studentId, {
        studentId: b.studentId,
        studentName: b.studentName,
        className: b.className,
        totalRaw: b.totalRaw,
        totalNmt: b.totalNmt,
        blocks: [],
      });
    }
    studentMap.get(b.studentId).blocks.push(b);
  }

  const students = [...studentMap.values()].map((s) => {
    const allRows = s.blocks.flatMap((b) => b.rows);
    const totalQ = allRows.length;
    const correctQ = allRows.filter((r) => r.points > 0).length;
    const durationsValid = s.blocks
      .map((b) => b.durationMin)
      .filter((d) => d !== null && d > 0);
    const avgDuration =
      durationsValid.length > 0
        ? Math.round(
            durationsValid.reduce((a, d) => a + d, 0) / durationsValid.length
          )
        : null;
    // average NMT across all subjects the student wrote
    const avgNmt = Math.round(
      s.blocks.reduce((sum, b) => sum + b.totalNmt, 0) / s.blocks.length
    );
    const totalRaw = s.blocks.reduce((sum, b) => sum + b.blockRaw, 0);
    return {
      ...s,
      totalNmt: avgNmt,
      totalRaw,
      totalQ,
      correctQ,
      accuracy: totalQ > 0 ? correctQ / totalQ : 0,
      avgDuration,
    };
  });

  // --- questions: aggregate per (subject, questionText) ---
  const questionMap = new Map();
  for (const r of normalized) {
    const key = `${r.subject}||${r.question}`;
    if (!questionMap.has(key)) {
      questionMap.set(key, {
        subject: r.subject,
        subjectShort: shortSubject(r.subject),
        question: r.question,
        type: r.type,
        correctAnswer: r.correctAnswer,
        total: 0,
        correct: 0,
        answers: [],
      });
    }
    const q = questionMap.get(key);
    q.total += 1;
    if (r.points > 0) q.correct += 1;
    q.answers.push({
      studentId: r.studentId,
      studentName: r.studentName,
      className: r.className,
      studentAnswer: r.studentAnswer,
      points: r.points,
      isCorrect: r.points > 0,
    });
  }

  const questions = [...questionMap.values()].map((q) => ({
    ...q,
    accuracy: q.total > 0 ? q.correct / q.total : 0,
  }));

  return { blocks, students, questions, subjects, classes, hasClasses };
}
