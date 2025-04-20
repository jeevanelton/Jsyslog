import React from 'react';

const Filters = ({ search, setSearch, from, setFrom, to, setTo, onReset, onFilter }) => (
    <div className="flex gap-4 flex-wrap items-center mb-6">
      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border border-gray-300 rounded shadow-sm"
      />
      <label className="flex flex-col text-sm text-gray-700">
        From:
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => {
            console.log("Selected from:", e.target.value);
            setFrom(e.target.value);
          }}
          className="p-2 border border-gray-300 rounded"
        />
      </label>
      <label className="flex flex-col text-sm text-gray-700">
        To:
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </label>
      <button
        onClick={onFilter}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
      >
        🔍 Filter
      </button>
      <button
        onClick={onReset}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
      >
        🔁 View Latest
      </button>
    </div>
  );
  
export default Filters;