import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Sparkles, Send, AlertCircle, BarChart3, Table as TableIcon, Code, ChevronDown, ChevronUp } from 'lucide-react';
import Plot from 'react-plotly.js';

const saveHistory = (question, status, time) => {
  try {
    const hist = JSON.parse(localStorage.getItem('bizquery_history') || '[]');
    hist.unshift({ question, status, time, date: new Date().toISOString() });
    localStorage.setItem('bizquery_history', JSON.stringify(hist.slice(0, 50)));
  } catch(e){}
};

const AIQuery = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showSql, setShowSql] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);
    setShowSql(false);
    
    const startTime = performance.now();
    try {
      const res = await api.post('/api/query/generate', { question });
      setResponse(res.data);
      saveHistory(question, res.data.error ? 'Error' : 'Success', ((performance.now() - startTime) / 1000).toFixed(2) + 's');
    } catch (err) {
      setError('Unable to connect to the business database or API.');
      saveHistory(question, 'Failed', ((performance.now() - startTime) / 1000).toFixed(2) + 's');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">AI Query</h2>
          <p className="text-gray-400 mt-2">Ask your business question in natural language.</p>
        </div>
      </div>
      
      <div className="flex-1 bg-[#1a1d27] border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {!response && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                <Sparkles size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-300">Ask anything about your business...</h3>
              <div className="flex gap-2 flex-wrap justify-center mt-4 max-w-2xl">
                {['What was our revenue last month?', 'Which products generated the highest profit?', 'Show monthly revenue for 2026.'].map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setQuestion(q); }}
                    className="bg-[#252a36] hover:bg-[#2d3342] text-gray-300 text-sm px-4 py-2 rounded-full border border-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <Sparkles className="animate-pulse text-blue-500" size={32} />
              <div className="text-lg font-medium text-gray-300">Analyzing intent & retrieving data...</div>
              <p className="text-sm text-gray-500">This may take a few seconds.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start space-x-3 mb-6">
              <AlertCircle className="text-red-400 mt-0.5" size={18} />
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}

          {response && (
            <div className="space-y-6 pb-4">
              <div className="bg-[#0f1117] border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-300 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-xs font-bold">Q</span>
                  {question}
                </h3>
              </div>
              
              {response.needs_clarification ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl flex items-start space-x-4">
                  <AlertCircle className="text-amber-400 shrink-0" size={24} />
                  <div>
                    <h3 className="text-amber-400 font-semibold mb-2">Clarification Needed</h3>
                    <p className="text-amber-200/80 text-sm">{response.clarification_message}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {response.error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 flex items-center gap-3">
                      <AlertCircle size={20}/> {response.error}
                    </div>
                  )}

                  {/* AI Explanation */}
                  {response.explanation && !response.error && (
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-blue-400"/>
                        <span className="text-xs font-semibold text-blue-400 uppercase">AI Explanation</span>
                      </div>
                      <p className="text-sm text-gray-300">{response.explanation}</p>
                    </div>
                  )}

                  {/* KPI Cards */}
                  {response.kpis && response.kpis.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {response.kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-[#14161f] border border-gray-800 p-4 rounded-xl flex flex-col justify-center">
                          <span className="text-xs text-gray-500 uppercase font-semibold mb-1 truncate">{kpi.label}</span>
                          <span className="text-2xl font-bold text-white truncate">{kpi.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty Data State */}
                  {(!response.rows || response.rows.length === 0) && !response.error && (
                    <div className="p-12 text-center text-gray-500 border border-gray-800 border-dashed rounded-xl bg-[#14161f]">
                      <TableIcon size={32} className="mx-auto mb-3 opacity-20" />
                      No matching data was found for this query.
                    </div>
                  )}

                  {/* Visuals & Table */}
                  {response.rows && response.rows.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Chart */}
                      {response.chart ? (
                        <div className="bg-[#14161f] border border-gray-800 p-4 rounded-xl flex flex-col">
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={16} className="text-purple-400"/>
                            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Visualization</h4>
                          </div>
                          <div className="flex-1 w-full relative min-h-[350px]">
                            <Plot
                              data={response.chart.data}
                              layout={{
                                ...response.chart.layout,
                                autosize: true,
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%', position: 'absolute' }}
                              config={{ displayModeBar: false, responsive: true }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#14161f] border border-gray-800 p-6 rounded-xl flex items-center justify-center text-gray-500 text-sm italic">
                          Visualization not applicable for this data shape.
                        </div>
                      )}

                      {/* Results Table */}
                      <div className="bg-[#14161f] border border-gray-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
                        <div className="flex items-center gap-2 p-4 border-b border-gray-800">
                          <TableIcon size={16} className="text-emerald-400"/>
                          <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Data Results</h4>
                          <span className="ml-auto text-xs text-gray-500 bg-[#252a36] px-2 py-1 rounded-full">{response.summary}</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-[#0f1117] sticky top-0 border-b border-gray-800">
                              <tr>
                                {response.columns.map(c => (
                                  <th key={c} className="px-4 py-3 font-medium whitespace-nowrap">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {response.rows.slice(0, 100).map((row, idx) => (
                                <tr key={idx} className="hover:bg-[#252a36]/40 transition-colors">
                                  {response.columns.map(c => (
                                    <td key={c} className="px-4 py-2 text-gray-300 whitespace-nowrap max-w-xs truncate">
                                      {row[c] !== null ? String(row[c]) : <span className="text-gray-600 text-xs italic">NULL</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {response.rows.length > 100 && (
                          <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-800 bg-[#0f1117]">
                            Showing first 100 rows. (Paginated)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SQL Toggle */}
                  <div className="pt-4">
                    <button 
                      onClick={() => setShowSql(!showSql)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2"
                    >
                      <Code size={16} />
                      {showSql ? 'Hide SQL' : 'View SQL'}
                      {showSql ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {showSql && (
                      <div className="mt-3 bg-[#0f1117] border border-gray-800 rounded-xl overflow-hidden animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between p-3 bg-[#14161f] border-b border-gray-800">
                          <h4 className="text-xs text-gray-400 uppercase font-semibold">Executed Query</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${response.confidence > 0.8 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                            {Math.round(response.confidence * 100)}% Confidence
                          </span>
                        </div>
                        <pre className="p-4 text-blue-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          {response.sql}
                        </pre>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#14161f]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              placeholder="Ask a question about your data..." 
              className="w-full bg-[#1a1d27] border border-gray-700 rounded-xl pl-4 pr-32 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 text-base"
            />
            <button 
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:hover:bg-blue-600 text-sm"
            >
              Ask AI <Sparkles size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIQuery;
