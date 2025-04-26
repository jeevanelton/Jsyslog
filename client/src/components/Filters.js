import React from "react";

const Filters = ({ search, setSearch, from, setFrom, to, setTo, severity, setSeverity, facility, setFacility, onReset, onFilter }) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border p-2 rounded w-full sm:w-40"
        >
          <option value="">All Severities</option>
          <option value="emerg">emerg</option>
          <option value="alert">alert</option>
          <option value="crit">crit</option>
          <option value="err">err</option>
          <option value="warning">warning</option>
          <option value="notice">notice</option>
          <option value="info">info</option>
          <option value="debug">debug</option>
        </select>

        <select
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
          className="border p-2 rounded w-full sm:w-40"
        >
          <option value="">All Facilities</option>
          <option value="auth">auth</option>
          <option value="mail">mail</option>
          <option value="daemon">daemon</option>
          <option value="kern">kern</option>
          <option value="user">user</option>
          <option value="local0">local0</option>
          <option value="local1">local1</option>
          <option value="local2">local2</option>
          <option value="local3">local3</option>
          <option value="local4">local4</option>
          <option value="local5">local5</option>
          <option value="local6">local6</option>
          <option value="local7">local7</option>
        </select>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded w-full sm:w-56"
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded w-full sm:w-56"
        />
      </div>

      <div className="flex gap-4">
        <button onClick={onFilter} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Apply Filter
        </button>
        <button onClick={onReset} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Filters;
