import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';

const QueryHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('bizquery_history') || '[]');
      setHistory(hist);
    } catch(e){}
  }, []);

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Query History</h2>
        <p className="text-[#6d949b] text-sm mt-1">Recent natural language query activity across your workspace.</p>
      </div>

      <div className="bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] rounded-2xl overflow-hidden shadow-2xl">
        {history.length === 0 ? (
          <div className="p-16 text-center text-[#557b81] flex flex-col items-center">
            <HistoryIcon size={44} className="opacity-30 mb-3 text-[#00e5bf]"/>
            <p className="text-sm">No queries executed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#021316] border-b border-[#0d3b41] text-[#6d949b] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Question</th>
                  <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-5 py-3.5 font-semibold">Execution</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#092c31]">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-[#06282e]/60 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium max-w-md truncate">
                      {h.question}
                    </td>
                    <td className="px-5 py-3.5 text-[#6c9197]">
                      {new Date(h.date).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[#00e5bf] flex items-center gap-1.5">
                      <Clock size={12}/> {h.time}
                    </td>
                    <td className="px-5 py-3.5">
                      {h.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1 text-[#00e5bf] bg-[#00e5bf]/10 border border-[#00e5bf]/25 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 size={11}/> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <XCircle size={11}/> Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryHistory;
