import { useState, useMemo, useCallback } from "react";
import "./index.css";
import Papa from "papaparse";
import UploadScreen from "./components/UploadScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { analyzeData } from "./lib/analyze.js";

const REQUIRED_COLUMNS = ["Предмет (Блок)", "Питання", "Балів за питання"];
const REQUIRED_ID = ["Email", "Студент"];

function validateColumns(fields) {
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
  if (!REQUIRED_ID.some((c) => fields.includes(c))) missing.unshift("Email або Студент");
  return missing;
}

export default function App() {
  const [fileState, setFileState] = useState(null); // { rows, fileName, loadedAt }

  const data = useMemo(
    () => (fileState ? analyzeData(fileState.rows) : null),
    [fileState]
  );

  // Called from Dashboard "Замінити файл" — re-parse new file
  const handleReplace = useCallback((file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete({ data: rows, meta }) {
        const missing = validateColumns(meta.fields || []);
        if (missing.length > 0) return; // silently ignore; UploadScreen handles errors
        setFileState({ rows, fileName: file.name, loadedAt: new Date() });
      },
    });
  }, []);

  if (!fileState || !data) {
    return <UploadScreen onData={setFileState} />;
  }

  return (
    <Dashboard
      data={data}
      fileState={fileState}
      onReplace={handleReplace}
    />
  );
}
