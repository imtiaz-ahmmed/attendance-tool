import React, { useState } from "react";
import AttendanceUploader from "./components/AttendanceUploader";
import AttendanceTable from "./components/AttendanceTable";
import * as XLSX from "xlsx";

function App() {
  const [results, setResults] = useState([]);
  const [userList, setUserList] = useState({});
  const [rawAttendance, setRawAttendance] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const allIds = Array.from(new Set(results.map((r) => r.userId)));

  // EXPORT All or Selected
  const exportData = (userIds, fileName) => {
    const wb = XLSX.utils.book_new();
    const filtered = results.filter((r) => userIds.includes(r.userId));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filtered), "All");
    userIds.forEach((uid) => {
      const rows = results.filter((r) => r.userId === uid);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(rows),
        userList[uid] || String(uid)
      );
    });
    XLSX.writeFile(wb, fileName);
  };

  // Export Individual
  const exportUser = (userId) => {
    const wb = XLSX.utils.book_new();
    const rows = results.filter((r) => r.userId === userId);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      rows[0]?.userName || String(userId)
    );
    XLSX.writeFile(wb, `Attendance_${rows[0]?.userName || userId}.xlsx`);
  };

  return (
    <div className="container pt-5 pb-4 mx-auto w-75">
      <h1 className="display-5 text-center mb-4">Attendance Web Tool</h1>
      <AttendanceUploader
        setResults={setResults}
        setUserList={setUserList}
        setRawAttendance={setRawAttendance}
      />
      {results.length > 0 && (
        <div className="my-4 d-flex flex-wrap gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => exportData(allIds, "Attendance_All.xlsx")}
          >
            Download All (All Sheets)
          </button>
          <button
            className="btn btn-success"
            disabled={selectedIds.length === 0}
            onClick={() => exportData(selectedIds, "Attendance_Selected.xlsx")}
          >
            Download Selected ({selectedIds.length})
          </button>
        </div>
      )}
      <AttendanceTable
        results={results}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        allIds={allIds}
        exportUser={exportUser}
      />
    </div>
  );
}
export default App;
