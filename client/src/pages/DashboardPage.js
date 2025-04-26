import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LogTable from "../components/LogTable";

const socket = io("http://localhost:3000");

const DashboardPage = () => {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log("✅ Connected to socket.io server (Dashboard)");
    });

    socket.on('new-log', (log) => {
      setLogs(prev => [...prev, log]);
    });

    socket.on('disconnect', () => {
      console.log("❌ Disconnected from socket.io server");
    });

    return () => {
      socket.off('connect');
      socket.off('new-log');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📡 Dashboard - Live Events</h1>
      <div className="border rounded p-2 max-h-[75vh] overflow-y-scroll bg-white">
        <LogTable logs={logs} />
        <div ref={bottomRef}></div>
      </div>
    </div>
  );
};

export default DashboardPage;
