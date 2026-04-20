import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { UploadCloud, BarChart2, AlertTriangle, FileText, Users } from "lucide-react";

const REQUIRED_COLUMNS = ["Предмет (Блок)", "Питання", "Балів за питання"];
const REQUIRED_ID = ["Email", "Студент"];

function validateColumns(fields) {
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
  const hasId = REQUIRED_ID.some((c) => fields.includes(c));
  if (!hasId) missing.unshift("Email або Студент");
  return missing;
}

export default function UploadScreen({ onData }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Оберіть файл у форматі CSV.");
        return;
      }
      setError(null);
      setLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete({ data, meta }) {
          setLoading(false);
          const missing = validateColumns(meta.fields || []);
          if (missing.length > 0) {
            setError(
              `У файлі відсутні обов'язкові колонки: ${missing.join(", ")}.`
            );
            return;
          }
          onData({ rows: data, fileName: file.name, loadedAt: new Date() });
        },
        error(err) {
          setLoading(false);
          setError(`Помилка парсингу: ${err.message}`);
        },
      });
    },
    [onData]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile]
  );

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => processFile(e.target.files[0]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
            Швидка аналітика НМТ-експортів
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Завантажте CSV-файл з експорту платформи — і отримайте рейтинг учнів,
            аналіз складних питань та детальний профіль кожного.
          </p>
        </div>

        {/* Drop zone card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
              dragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-300 hover:border-emerald-400 hover:bg-stone-50",
            ].join(" ")}
          >
            <UploadCloud
              className={`w-10 h-10 ${dragging ? "text-emerald-500" : "text-stone-400"}`}
              strokeWidth={1.5}
            />
            <p className="text-stone-600 text-sm text-center">
              {dragging
                ? "Відпустіть файл тут"
                : "Перетягніть CSV-файл або натисніть, щоб обрати"}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              disabled={loading}
              className="mt-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Обробка…" : "Обрати CSV"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: Users, label: "Рейтинг", desc: "Таблиця учнів з балами та точністю" },
            { icon: AlertTriangle, label: "Важкі питання", desc: "Топ питань, де найбільше помилок" },
            { icon: FileText, label: "Профіль учня", desc: "Детальні відповіді по кожному блоку" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm"
            >
              <Icon className="w-5 h-5 text-emerald-700 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-stone-700">{label}</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
