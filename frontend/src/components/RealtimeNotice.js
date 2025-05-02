import React from 'react';

const RealtimeNotice = ({ visible, onRefresh }) => {
  if (!visible) return null;
  return (
    <div className="text-red-600 font-bold mb-4">
      ⚠️ New logs available. <button onClick={onRefresh} className="underline">View Latest</button>
    </div>
  );
};

export default RealtimeNotice;