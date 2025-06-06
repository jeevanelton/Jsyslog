import React, { useState } from "react";

const LogTable = ({ logs }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(index === expandedRow ? null : index);
  };

  return (
  <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
    <table className="min-w-full text-sm text-left whitespace-nowrap">
      <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase tracking-wider text-gray-600">
        <tr>
          <th className="px-4 py-2">Severity</th>
          <th className="px-4 py-2">Facility</th>
          <th className="px-4 py-2">Hostname</th>
          <th className="px-4 py-2">IP Address</th>
          <th className="px-4 py-2">Message</th>
          <th className="px-4 py-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <React.Fragment key={index}>
            <tr
              onClick={() => toggleRow(index)}
              className={`cursor-pointer border-b transition duration-150 ease-in-out ${
                log.severity === "crit" || log.severity === "alert"
                  ? "bg-rose-50 text-rose-800"
                  : log.severity === "warning"
                  ? "bg-yellow-50 text-yellow-800"
                  : log.severity === "debug"
                  ? "text-gray-500"
                  : "text-gray-800"
              } hover:bg-gray-100`}
            >
              <td className="px-4 py-2 font-medium">{log.severity}</td>
              <td className="px-4 py-2">{log.facility}</td>
              <td className="px-4 py-2">{log.hostname}</td>
              <td className="px-4 py-2">{log.host_address}</td>
              <td className="px-4 py-2 truncate max-w-xs">{log.message}</td>
              <td className="px-4 py-2">{log.received_at || log.date}</td>
            </tr>

            {expandedRow === index && (
              <tr className="bg-gray-50">
                <td colSpan="6" className="px-6 py-4 text-sm text-gray-700">
                  <div className="space-y-1">
                    <div><strong>🔍 Raw:</strong> <span className="whitespace-pre-wrap break-all">{log.raw}</span></div>
                    <div><strong>🧱 Severity:</strong> {log.severity}</div>
                    <div><strong>🏷️ Facility:</strong> {log.facility}</div>
                    <div><strong>🖥️ Hostname:</strong> {log.hostname}</div>
                    <div><strong>📡 IP Address:</strong> {log.host_address}</div>
                    <div><strong>📄 Message:</strong> {log.message}</div>
                    <div><strong>⏰ Date:</strong> {log.received_at || log.date}</div>
                  </div>
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
