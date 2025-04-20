import React, { useEffect, useState } from 'react';
import LogTable from './components/LogTable';
import Filters from './components/Filters';
import RealtimeNotice from './components/RealtimeNotice';
import socketIOClient from 'socket.io-client';
import './index.css';

const socket = socketIOClient("http://localhost:3000");

function App() {
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
    setNewLogNotice(false);
  };

  useEffect(() => {
    fetchLogs(page, search, from, to);
  }, [page, search, from, to]);

  useEffect(() => {
    console.log("Connecting to socket...");
  socket.on('connect', () => {
    console.log("✅ Connected to socket.io server");
    });
    socket.on('new-log', log => {
      console.log("🔥 Received real-time log:", log);
      if (page === 1 && !search && !from && !to) {
        setLogs(prev => [log, ...prev.slice(0, limit - 1)]);
      } else {
        setNewLogNotice(true);
      }
    });
    return () => socket.disconnect();
  }, [page, search, from, to]);

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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📡 jsyslogd - Real-Time Syslog Dashboard</h1>

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
}

export default App;