import React, { useEffect, useState } from "react";
import LogTable from "../components/LogTable";
import Filters from "../components/Filters";
import RealtimeNotice from "../components/RealtimeNotice";

const API_BASE = process.env.REACT_APP_API_BASE;

const EventsExplorerPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [newLogNotice, setNewLogNotice] = useState(false);
  const [severityFilter, setSeverityFilter] = useState([]);
  const [facilityFilter, setFacilityFilter] = useState([]);
  const [logic, setLogic] = useState('and');
  const [useRegex, setUseRegex] = useState(false);
  const [error, setError] = useState('');

  const limit = 20;

  const fetchLogs = async (page, search, from, to, severity, facility, logic, regex) => {
    setError(""); // Clear existing error
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (severity.length) severity.forEach(s => params.append("severity", s));
      if (facility.length) facility.forEach(f => params.append("facility", f));
      if (logic) params.append("logic", logic);
      if (regex) params.append("regex", regex);
  
      const res = await fetch(`${API_BASE}/logs?${params.toString()}`);
      const data = await res.json();
  
      if (!res.ok) {
        setLogs([]);
        setError(data.error || "Unknown error occurred.");
      } else {
        setLogs(data);
        setNewLogNotice(false);
      }
    } catch (err) {
      setError("Failed to fetch logs.");
    }
  };

  useEffect(() => {
    fetchLogs(page, search, from, to, severityFilter, facilityFilter, logic, useRegex);
  }, [page]);

  const handleReset = () => {
    setSearch('');
    setFrom('');
    setTo('');
    setSeverityFilter([]);
    setFacilityFilter([]);
    setLogic('and');
    setUseRegex(false);
    setPage(1);
    fetchLogs(1, '', '', '', [], [], 'and', false);
  };

  const handleFilter = () => {
    fetchLogs(1, search, from, to, severityFilter, facilityFilter, logic, useRegex);
    setPage(1);
  };

  const downloadCSV = () => {
    if (!logs.length) {
      alert("No logs to download!");
      return;
    }

    const header = ["Severity", "Facility", "Hostname", "IP Address", "Message", "Date"];
    const rows = logs.map(log => [
      log.severity,
      log.facility,
      log.hostname,
      log.host_address,
      log.message.replace(/"/g, '""'),
      log.received_at || log.date
    ]);
    const csvContent = [header, ...rows].map(row => row.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `logs_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen w-full">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-extrabold mb-4 text-gray-800">🔎 Events Explorer</h1>

        <Filters
          search={search} setSearch={setSearch}
          from={from} setFrom={setFrom}
          to={to} setTo={setTo}
          severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
          facilityFilter={facilityFilter} setFacilityFilter={setFacilityFilter}
          logic={logic} setLogic={setLogic}
          useRegex={useRegex} setUseRegex={setUseRegex}
          onReset={handleReset} onFilter={handleFilter}
        />

        <RealtimeNotice visible={newLogNotice} onRefresh={handleReset} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-4 sm:mb-0"
          >📥 Download CSV</button>

          {error && (
            <div className="text-red-600 bg-red-100 p-3 rounded border border-red-300 w-full sm:w-auto">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <LogTable logs={logs} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full sm:w-auto">⬅ Prev</button>
        <span className="text-gray-700 text-center">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full sm:w-auto">Next ➡</button>
      </div>
    </div>
  );
};

export default EventsExplorerPage;
