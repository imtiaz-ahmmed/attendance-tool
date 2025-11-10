import React, { useState } from "react";
import AttendanceUploader from "./components/AttendanceUploader";
import AttendanceTable from "./components/AttendanceTable";

function App() {
  const [results, setResults] = useState([]);
  return (
    <div>
      <h1>Attendance Web Tool</h1>
      <AttendanceUploader setResults={setResults} />
      <hr />
      {results.length > 0 ? (
        <AttendanceTable results={results} />
      ) : (
        <div>No attendance found for selected range.</div>
      )}
    </div>
  );
}
export default App;
