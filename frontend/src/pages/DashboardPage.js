import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LogTable from "../components/LogTable";
import LogsSecChart from "../components/LogsSecChart";
import SeverityChart from "../components/SeverityChart";



const socket = io({
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
  const [severityData, setSeverityData] = useState([]);

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

  // fetch severity summary
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetch('/logs/summary');
        const data = await res.json();
        setSeverityData(data);
      } catch (err) {
        console.error('Failed to load summary', err);
      }
    };
    loadSummary();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
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
    <div className="p-6 font-sans bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📡 Real-Time Dashboard</h1>

      {/* Server Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">🧠 Logs/sec</h2>
            <p className="text-2xl">{stats.logsPerSecond}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">📂 Total Logs</h2>
            <p className="text-2xl">{stats.totalLogs}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">⏳ Uptime</h2>
            <p className="text-2xl">{Math.floor(stats.uptime / 60)} min</p>
          </div>
          <div className={`p-4 rounded shadow ${getStatusColor(stats.cpu)}`}>
            <h2 className="text-lg font-bold">🖥️ CPU Usage</h2>
            <p className="text-2xl">{stats.cpu}%</p>
          </div>
          <div className={`p-4 rounded shadow ${getStatusColor(stats.memory)}`}>
            <h2 className="text-lg font-bold">💾 Memory Usage</h2>
            <p className="text-2xl">{stats.memory}%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-2">📈 Logs/sec Trend (Last 1 min)</h2>
          <LogsSecChart dataPoints={logsPerSecHistory} />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-2">📊 Severity Distribution</h2>
          <SeverityChart data={severityData} />
        </div>
      </div>

      {/* Logs Table */}
      <div className="border rounded p-2 max-h-[65vh] overflow-y-auto bg-white">
        <LogTable logs={logs} />
      </div>
    </div>
  );
};

export default DashboardPage;
