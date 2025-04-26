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

  

  const limit = 20;

  const fetchLogs = async (page, search, from, to) => {
    let url = `/logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (from) url += `&from=${encodeURIComponent(from)}`;
    if (to) url += `&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    const data = await res.json();
   
    setLogs(data);
    console.log("Fetched logs:", data);
    setNewLogNotice(false);
  };

  useEffect(() => {
    fetchLogs(page, search, from, to);
  }, [page]);


  const handleReset = () => {
    setSearch('');
    setFrom('');
    setTo('');
    setPage(1);
    fetchLogs(1, '', '', '');
  };

  const handleFilter = () => {
    fetchLogs(1, search, from, to);
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
