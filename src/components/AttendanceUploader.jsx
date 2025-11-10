import React, { useState } from "react";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

// Convert Excel serial to JS Date
function excelSerialDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return null;
  let days = Math.floor(serial);
  let date = new Date(1899, 11, 30 + days); // Excel "zero"
  let fraction = serial - days;
  if (fraction > 0) {
    let seconds = Math.round(fraction * 86400);
    date.setSeconds(seconds);
  }
  return date;
}

const AttendanceUploader = ({ setResults }) => {
  const [startDate, setStartDate] = useState(new Date("2020-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31"));
  const [userFile, setUserFile] = useState(null);
  const [users, setUsers] = useState({});
  const [attendanceFile, setAttendanceFile] = useState(null);

  // Parse User Info File and store mapping USERID->Name
  const handleUserFile = () => {
    if (!userFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      // Map: USERID => Name
      const mapping = {};
      data.forEach((row) => {
        if (row.USERID && row.Name) {
          mapping[row.USERID] = row.Name;
        }
      });
      setUsers(mapping);
      alert("User mapping loaded! Now upload attendance file.");
    };
    reader.readAsArrayBuffer(userFile);
  };

  // Parse Attendance File and use mapping
  const handleAttendanceFile = () => {
    if (!attendanceFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
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
        date: records[0]._parsedDate.toLocaleDateString(),
        in: records[0]._parsedDate.toLocaleTimeString(),
        out: records[records.length - 1]._parsedDate.toLocaleTimeString(),
        inType: records[0].CHECKTYPE,
        outType: records[records.length - 1].CHECKTYPE,
      };
    });
    setResults(processed);
  };

  return (
    <div>
      <div>
        <strong>Step 1: Upload User Info File (.xlsx): </strong>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setUserFile(e.target.files[0])}
        />
        <button onClick={handleUserFile}>Load User List</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Step 2: Select Date Range</strong>
        <br />
        <span>Start Date: </span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd-MM-yyyy"
        />
        <span> End Date: </span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="dd-MM-yyyy"
          minDate={startDate}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Step 3: Upload Attendance File (.xlsx): </strong>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setAttendanceFile(e.target.files[0])}
        />
        <button
          onClick={handleAttendanceFile}
          disabled={!users || Object.keys(users).length === 0}
        >
          Upload Attendance
        </button>
      </div>
    </div>
  );
};

export default AttendanceUploader;
