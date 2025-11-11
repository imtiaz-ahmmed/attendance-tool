import React from "react";

export default function AttendanceTable({
  results,
  selectedIds,
  setSelectedIds,
  allIds,
  exportUser,
}) {
  const handleToggleAll = (e) => {
    setSelectedIds(e.target.checked ? allIds : []);
  };
  const handleToggle = (userId) => {
    if (selectedIds.includes(userId))
      setSelectedIds(selectedIds.filter((id) => id !== userId));
    else setSelectedIds([...selectedIds, userId]);
  };

  return (
    <div className="table-responsive mt-4">
      <div className="mb-2">
        <label>
          <input
            type="checkbox"
            checked={selectedIds.length === allIds.length && allIds.length > 0}
            onChange={handleToggleAll}
            className="form-check-input me-2"
          />
          <span className="fw-bold">Select all</span>
        </label>
      </div>
      <table className="table table-striped table-bordered align-middle">
        <thead className="table-info">
          <tr>
            <th>Select</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>In Time</th>
            <th>Out Time</th>
            <th>In Type</th>
            <th>Out Type</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={r.userId + r.date + i}>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedIds.includes(r.userId)}
                  onChange={() => handleToggle(r.userId)}
                />
              </td>
              <td>{r.userId}</td>
              <td>{r.userName}</td>
              <td>{r.date}</td>
              <td>{r.in}</td>
              <td>{r.out}</td>
              <td>{r.inType}</td>
              <td>{r.outType}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => exportUser(r.userId)}
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
