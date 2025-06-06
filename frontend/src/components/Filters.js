import React from "react";

const SEVERITY_OPTIONS = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];
const FACILITY_OPTIONS = [
  "kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "news",
  "uucp", "cron", "authpriv", "ftp", "ntp", "security", "console", "solaris-cron",
  "local0", "local1", "local2", "local3", "local4", "local5", "local6", "local7", "device"
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
  <div className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-6">
    {/* 🔍 Search */}
    <div>
      <label className="block text-sm font-semibold mb-1 text-gray-700">Search (Message or Hostname)</label>
      <input
        type="text"
        placeholder="e.g. kernel panic"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* 📅 Date Range */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">From</label>
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">To</label>
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* 🚨 Severity Tags */}
    <div>
      <label className="block text-sm font-semibold mb-1 text-gray-700">Severity (Multi-select)</label>
      <div className="flex flex-wrap gap-2">
        {SEVERITY_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => toggleSelection(opt, severityFilter, setSeverityFilter)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              severityFilter.includes(opt)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>

    {/* 🏢 Facility Tags */}
    <div>
      <label className="block text-sm font-semibold mb-1 text-gray-700">Facility (Multi-select)</label>
      <div className="flex flex-wrap gap-2">
        {FACILITY_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => toggleSelection(opt, facilityFilter, setFacilityFilter)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              facilityFilter.includes(opt)
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>

    {/* ⚙️ Extra Options */}
    <div className="flex flex-wrap gap-6 items-center pt-2">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={useRegex}
          onChange={(e) => setUseRegex(e.target.checked)}
        />
        Use Regex
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        Logic:
        <select
          value={logic}
          onChange={(e) => setLogic(e.target.value)}
          className="border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
      </label>
    </div>

    {/* 🎛️ Actions */}
    <div className="pt-4 flex flex-wrap gap-4">
      <button
        onClick={onFilter}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg shadow-sm"
      >
        🔍 Apply Filters
      </button>
      <button
        onClick={onReset}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-5 rounded-lg shadow-sm"
      >
        🔄 Reset
      </button>
    </div>
  </div>
);

};

export default Filters;
