import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle, XCircle } from 'lucide-react';

const QueryHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('bizquery_history') || '[]');
      setHistory(hist);
    } catch(e){}
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Query History</h2>
        <p className="text-gray-400 mt-2">Recent activity across the platform.</p>
      </div>

      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        {history.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <HistoryIcon size={48} className="opacity-20 mb-4"/>
            No queries executed yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0f1117] border-b border-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Question</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Execution</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-[#252a36]/50 transition-colors">
                  <td className="px-6 py-4 text-gray-200 font-medium">{h.question}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(h.date).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400 flex items-center gap-1"><Clock size={14}/> {h.time}</td>
                  <td className="px-6 py-4">
                    {h.status === 'Success' ? (
                      <span className="flex w-fit items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-semibold">
                        <CheckCircle size={14}/> Success
                      </span>
                    ) : (
                      <span className="flex w-fit items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-semibold">
                        <XCircle size={14}/> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QueryHistory;
