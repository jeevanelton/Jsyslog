import React from 'react';

const LogTable = ({ logs }) => (
  <table className="w-full border text-sm bg-white shadow rounded">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="p-2 border">Time</th>
        <th className="p-2 border">Host</th>
        <th className="p-2 border">Tag</th>
        <th className="p-2 border">Message</th>
      </tr>
    </thead>
    <tbody>
      {logs.map((log, i) => (
        <tr key={i} className="border-t hover:bg-gray-50">
          <td className="p-2 border font-mono text-gray-700">{log.received_at}</td>
          <td className="p-2 border font-mono text-gray-700">{log.hostname}</td>
          <td className="p-2 border font-mono text-gray-700">{log.tag}</td>
          <td className="p-2 border font-mono text-gray-700">{log.message}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default LogTable;