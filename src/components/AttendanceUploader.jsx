import React, { useState } from "react";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

// Helper: Excel serial date to JS Date
function excelSerialDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return null;
  let days = Math.floor(serial);
  let date = new Date(1899, 11, 30 + days);
  let fraction = serial - days;
  if (fraction > 0) {
    let seconds = Math.round(fraction * 86400);
    date.setSeconds(seconds);
  }
  return date;
}

// Helper: Format date as DD/MM/YYYY
function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

const AttendanceUploader = ({ setResults, setUserList, setRawAttendance }) => {
  const [startDate, setStartDate] = useState(new Date("2020-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31"));
  const [userFile, setUserFile] = useState(null);
  const [users, setUsers] = useState({});
  const [attendanceFile, setAttendanceFile] = useState(null);

  // Parse user info file
  const handleUserFile = () => {
    if (!userFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      const mapping = {};
      data.forEach((row) => {
        if (row.USERID && row.Name) mapping[row.USERID] = row.Name;
      });
      setUsers(mapping);
      setUserList(mapping);
      alert("User mapping loaded! Now upload attendance file.");
    };
    reader.readAsArrayBuffer(userFile);
  };

  // Parse attendance file
  const handleAttendanceFile = () => {
    if (!attendanceFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setRawAttendance(json);
      processAttendance(json);
    };
    reader.readAsArrayBuffer(attendanceFile);
  };

  const processAttendance = (data) => {
    let grouped = {};
    data.forEach((row) => {
      const d = excelSerialDateToJSDate(row.CHECKTIME);
      if (!d || isNaN(d.getTime())) return;
      if (d >= startDate && d <= endDate) {
        const key = `${row.USERID}_${d.toISOString().slice(0, 10)}`;
        grouped[key] = grouped[key] || [];
        grouped[key].push({ ...row, _parsedDate: d });
      }
    });
    const processed = Object.values(grouped).map((records) => {
      records.sort((a, b) => a._parsedDate - b._parsedDate);
      const userId = records[0].USERID;
      return {
        userId,
        userName: users[userId] || "(Unknown)",
        date: formatDate(records[0]._parsedDate), // <-- DD/MM/YYYY here
        in: records[0]._parsedDate.toLocaleTimeString(),
        out: records[records.length - 1]._parsedDate.toLocaleTimeString(),
        inType: records[0].CHECKTYPE,
        outType: records[records.length - 1].CHECKTYPE,
      };
    });
    setResults(processed);
  };

  return (
    <div className="mb-4">
      <div className="card card-body mb-3 border-info">
        <h5 className="mb-3">Step 1: Upload User Info (.xlsx)</h5>
        <div className="row">
          <div className="col-md-7 mb-2">
            <input
              type="file"
              className="form-control"
              accept=".xlsx"
              onChange={(e) => setUserFile(e.target.files[0])}
            />
          </div>
          <div className="col-md-5">
            <button onClick={handleUserFile} className="btn btn-info w-100">
              Load User List
            </button>
          </div>
        </div>
      </div>
      <div className="card card-body mb-3 border-secondary">
        <h5 className="mb-3">Step 2: Pick Date Range</h5>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label>Start: </label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="dd-MM-yyyy"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label>End: </label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="dd-MM-yyyy"
              minDate={startDate}
              className="form-control"
            />
          </div>
        </div>
      </div>
      <div className="card card-body border-success">
        <h5 className="mb-3">Step 3: Upload Attendance (.xlsx)</h5>
        <div className="row">
          <div className="col-md-7 mb-2">
            <input
              type="file"
              className="form-control"
              accept=".xlsx"
              onChange={(e) => setAttendanceFile(e.target.files[0])}
            />
          </div>
          <div className="col-md-5">
            <button
              className="btn btn-success w-100"
              onClick={handleAttendanceFile}
              disabled={!users || Object.keys(users).length === 0}
            >
              Upload Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceUploader;
