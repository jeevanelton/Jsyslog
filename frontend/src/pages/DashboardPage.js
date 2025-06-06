import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LogTable from "../components/LogTable";
import LogsSecChart from "../components/LogsSecChart";

const API_BASE = process.env.REACT_APP_API_BASE;

const socket = io(API_BASE, {
  auth: {
    token: localStorage.getItem("token")
  }
});

const DashboardPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    uptime: 0,
    totalLogs: 0,
    logsPerSecond: 0,
    cpu: 0,
    memory: 0,
  });

  const [logsPerSecHistory, setLogsPerSecHistory] = useState([]);

  const MAX_LOGS = 30;

  useEffect(() => {
    socket.on('connect', () => {
      console.log("✅ Connected to socket.io server (Dashboard)");
    });

    socket.on('new-log', (log) => {
      setLogs(prev => {
        const newLogs = [log, ...prev];    // add new log at top
        if (newLogs.length > MAX_LOGS) {
          newLogs.pop();                  // remove oldest log if exceeds 30
        }
        return newLogs;
      });
    });

    socket.on('disconnect', () => {
      console.log("❌ Disconnected from socket.io server");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('new-log');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/stats`);
        const data = await res.json();
        setStats(data);

        setLogsPerSecHistory(prev => {
          const updated = [...prev, data.logsPerSecond];
          if (updated.length > 12) {   // Keep only 1 minute (if fetch every 5s)
            updated.shift();
          }
          return updated;
        });

      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  function getStatusColor(value) {
    if (value >= 80) return "bg-red-100 text-red-800";
    if (value >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  }

return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen w-full">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">📡 Real-Time Dashboard</h1>

      {/* Server Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-1">🧠 Logs/sec</h2>
          <p className="text-3xl font-bold">{stats.logsPerSecond}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-1">📂 Total Logs</h2>
          <p className="text-3xl font-bold">{stats.totalLogs}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-1">⏳ Uptime</h2>
          <p className="text-3xl font-bold">{Math.floor(stats.uptime / 60)} min</p>
        </div>
        <div className={`p-5 rounded-2xl shadow-md ${getStatusColor(stats.cpu)}`}>
          <h2 className="text-lg font-semibold mb-1">🖥️ CPU Usage</h2>
          <p className="text-3xl font-bold">{stats.cpu}%</p>
        </div>
        <div className={`p-5 rounded-2xl shadow-md ${getStatusColor(stats.memory)}`}> 
          <h2 className="text-lg font-semibold mb-1">💾 Memory Usage</h2>
          <p className="text-3xl font-bold">{stats.memory}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md col-span-1 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">📈 Logs/sec Trend (Last 1 min)</h2>
          <LogsSecChart dataPoints={logsPerSecHistory} />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-md p-4 w-full">
        <LogTable logs={logs} />
      </div>
    </div>
  );
};

export default DashboardPage;
