// 📦 Filters.js - Advanced Filters UI

import React, { useState } from "react";

const SEVERITY_OPTIONS = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];
const FACILITY_OPTIONS = [
  "auth", "authpriv", "cron", "daemon", "kern", "local0", "local1", "local2",
  "local3", "local4", "local5", "local6", "local7", "mail", "syslog", "user"
];

const Filters = ({
  search, setSearch,
  from, setFrom,
  to, setTo,
  severityFilter, setSeverityFilter,
  facilityFilter, setFacilityFilter,
  logic, setLogic,
  useRegex, setUseRegex,
  onReset, onFilter
}) => {
  const toggleSelection = (value, list, setList) => {
    setList(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Search field */}
        <input
          type="text"
          placeholder="Search message or hostname"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Date range */}
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Severity filter */}
        <div>
          <label className="text-sm font-medium">Severity</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SEVERITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleSelection(opt, severityFilter, setSeverityFilter)}
                className={`px-2 py-1 rounded text-sm border ${
                  severityFilter.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* Facility filter */}
        <div>
          <label className="text-sm font-medium">Facility</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {FACILITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleSelection(opt, facilityFilter, setFacilityFilter)}
                className={`px-2 py-1 rounded text-sm border ${
                  facilityFilter.includes(opt) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
            <span className="text-sm">Regex</span>
          </label>
          <label className="flex items-center gap-2">
            <select value={logic} onChange={(e) => setLogic(e.target.value)} className="border rounded p-1 text-sm">
              <option value="and">AND</option>
              <option value="or">OR</option>
            </select>
            <span className="text-sm">Logic</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={onFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >Apply Filters</button>

        <button
          onClick={onReset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >Reset</button>
      </div>
    </div>
  );
};

export default Filters;
