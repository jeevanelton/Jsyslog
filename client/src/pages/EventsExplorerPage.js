import React, { useEffect, useState } from "react";
import LogTable from "../components/LogTable";
import Filters from "../components/Filters";
import RealtimeNotice from "../components/RealtimeNotice";

const EventsExplorerPage = () => {

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [newLogNotice, setNewLogNotice] = useState(false);
  const [severity, setSeverity] = useState('');
  const [facility, setFacility] = useState('');
  

  const limit = 20;

  const fetchLogs = async (page, search, from, to, severity, facility) => {
    let url = `/logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (from) url += `&from=${encodeURIComponent(from)}`;
    if (to) url += `&to=${encodeURIComponent(to)}`;
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    if (facility) url += `&facility=${encodeURIComponent(facility)}`;
  
    const res = await fetch(url);
    const data = await res.json();
    setLogs(data);
    setNewLogNotice(false);
  };

  useEffect(() => {
    fetchLogs(page, search, from, to, severity, facility);
  }, [page]);


  const handleReset = () => {
    setSearch('');
    setFrom('');
    setTo('');
    setPage(1);
    setFacility('');
    setSeverity('');
    fetchLogs(1, '', '', '');
  };

  const handleFilter = () => {
    fetchLogs(1, search, from, to, severity, facility);
    setPage(1);
  };

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🔎 Events Explorer</h1>

      <Filters
        search={search}
        setSearch={setSearch}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        onReset={handleReset}
        onFilter={handleFilter}
        severity={severity}
        setSeverity={setSeverity}
        facility={facility}
        setFacility={setFacility}
      />

      <RealtimeNotice visible={newLogNotice} onRefresh={handleReset} />

      <LogTable logs={logs} />

      <div className="mt-6 flex items-center gap-6">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">⬅ Prev</button>
        <span className="text-gray-700">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Next ➡</button>
      </div>
    </div>
  );
};

export default EventsExplorerPage;
