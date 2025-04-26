import React, { useState } from "react";

const LogTable = ({ logs }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(index === expandedRow ? null : index);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Severity</th>
            <th className="p-2">Facility</th>
            <th className="p-2">Hostname</th>
            <th className="p-2">IP Address</th>
            <th className="p-2">Message</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <React.Fragment key={index}>
              <tr
                onClick={() => toggleRow(index)}
                className={`cursor-pointer transition-colors ${
                  log.severity === "crit" || log.severity === "alert"
                    ? "bg-red-50 text-red-800"
                    : log.severity === "warning"
                    ? "bg-yellow-50 text-yellow-800"
                    : log.severity === "debug"
                    ? "text-gray-600"
                    : "text-gray-800"
                } hover:bg-gray-100`}
              >
                <td className="p-2">{log.severity}</td>
                <td className="p-2">{log.facility}</td>
                <td className="p-2">{log.hostname}</td>
                <td className="p-2">{log.host_address}</td>
                <td className="p-2 truncate max-w-xs">{log.message}</td>
                <td className="p-2">{log.received_at || log.date}</td>
              </tr>

              {expandedRow === index && (
                <tr className="bg-gray-50 border-t">
                  <td colSpan="6" className="p-4 text-sm">
                    <div><strong>Raw:</strong> <span className="whitespace-pre-wrap break-all">{log.raw}</span></div>
                    <div><strong>Severity:</strong> {log.severity}</div>
                    <div><strong>Facility:</strong> {log.facility}</div>
                    <div><strong>Hostname:</strong> {log.hostname}</div>
                    <div><strong>IP Address:</strong> {log.host_address}</div>
                    <div><strong>Message:</strong> {log.message}</div>
                    <div><strong>Date:</strong> {log.received_at || log.date}</div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
