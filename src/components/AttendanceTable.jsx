import React from "react";

const AttendanceTable = ({ results }) => (
  <table border="1" cellPadding="5">
    <thead>
      <tr>
        <th>User ID</th>
        <th>User Name</th>
        <th>Date</th>
        <th>In Time</th>
        <th>Out Time</th>
        <th>In Type</th>
        <th>Out Type</th>
      </tr>
    </thead>
    <tbody>
      {results.map((r, i) => (
        <tr key={r.userId + r.date + i}>
          <td>{r.userId}</td>
          <td>{r.userName}</td>
          <td>{r.date}</td>
          <td>{r.in}</td>
          <td>{r.out}</td>
          <td>{r.inType}</td>
          <td>{r.outType}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AttendanceTable;
