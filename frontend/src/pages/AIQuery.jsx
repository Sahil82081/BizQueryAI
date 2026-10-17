import React, { useState } from 'react';
import api from '../utils/api';
import { 
  Sparkles, 
  Send, 
  AlertCircle, 
  BarChart3, 
  Table as TableIcon, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Zap,
  ArrowUp
} from 'lucide-react';
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
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = async (e, customQuery) => {
    e?.preventDefault();
    const queryText = (customQuery !== undefined ? customQuery : question).trim();
    if (!queryText) return;
    
    if (customQuery !== undefined) {
      setQuestion(customQuery);
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setShowSql(false);
    
    const startTime = performance.now();
    try {
      const res = await api.post('/api/query/generate', { question: queryText });
      setResponse(res.data);
      saveHistory(queryText, res.data.error ? 'Error' : 'Success', ((performance.now() - startTime) / 1000).toFixed(2) + 's');
    } catch (err) {
      setError('Unable to connect to the business database or API.');
      saveHistory(queryText, 'Failed', ((performance.now() - startTime) / 1000).toFixed(2) + 's');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = (sql) => {
    if (!sql) return;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-[1240px] mx-auto h-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#587e84] font-medium mb-1">
            <span>Analytics</span>
            <span>/</span>
            <span className="text-[#00e5bf]">AI Query Studio</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">AI Query</h2>
          <p className="text-[#6d949b] text-sm mt-0.5">Ask questions in plain English to generate verified SQL, KPIs, and interactive visual charts.</p>
        </div>

        {response && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#052125] border border-[#0d3b41] text-[#789fa5] text-xs font-mono">
              <Zap size={13} className="text-[#00e5bf]" />
              <span>Verified AST</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Main Glass Card Display Area */}
      <div className="flex-1 bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* 1. Empty Starter State */}
          {!response && !loading && !error && (
            <div className="flex flex-col items-center justify-center min-h-[360px] text-center space-y-6 text-[#5b8086]">
              <div className="w-16 h-16 rounded-2xl bg-[#00e5bf]/10 border border-[#00e5bf]/25 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,191,0.2)]">
                <Sparkles size={30} className="text-[#00e5bf]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Ask anything about your business...</h3>
                <p className="text-sm text-[#6d949b] mt-1 max-w-md mx-auto">
                  Type a business question below, or click any suggested prompt to analyze metrics instantly.
                </p>
              </div>

              {/* Suggested Pills with smooth hover */}
              <div className="flex gap-2 flex-wrap justify-center mt-2 max-w-2xl">
                {[
                  'What was our revenue last month?', 
                  'Which products generated the highest profit?', 
                  'Show monthly revenue for 2026.'
                ].map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setQuestion(q);
                      handleSubmit(null, q);
                    }}
                    className="flex items-center gap-1.5 bg-[#042429] hover:bg-[#07353c] hover:border-[#00e5bf]/50 border border-[#0d3b41] text-[#9fc2c7] hover:text-[#00e5bf] text-xs md:text-sm px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm"
                  >
                    <span className="text-[#00e5bf]">✦</span>
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[360px] text-[#6d949b] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00e5bf]/10 border border-[#00e5bf]/30 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,191,0.25)]">
                <Sparkles className="animate-pulse text-[#00e5bf]" size={28} />
              </div>
              <div className="text-base font-semibold text-white tracking-tight">Analyzing intent & retrieving data...</div>
              <p className="text-xs text-[#52787e] font-mono">Parsing AST syntax and executing secure read query...</p>
            </div>
          )}

          {/* 3. Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-start space-x-3 mb-6 animate-in fade-in">
              <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
              <div className="text-red-400 text-sm font-medium">{error}</div>
            </div>
          )}

          {/* 4. Active Results State */}
          {response && (
            <div className="space-y-6 pb-4">
              {/* Active Question Banner */}
              <div className="bg-[#021417] border border-[#0d3b41] p-4 rounded-xl flex items-center justify-between">
                <h3 className="text-sm md:text-base font-semibold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[#00e5bf]/20 text-[#00e5bf] border border-[#00e5bf]/30 flex items-center justify-center mr-3 text-xs font-bold font-mono">
                    Q
                  </span>
                  {question}
                </h3>
              </div>
              
              {/* Clarification prompt if model needs it */}
              {response.needs_clarification ? (
                <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-amber-400 font-bold text-sm mb-1">Clarification Needed</h3>
                    <p className="text-amber-200/80 text-xs leading-relaxed">{response.clarification_message}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Backend error message if query failed */}
                  {response.error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-mono border border-red-500/20 flex items-center gap-2.5">
                      <AlertCircle size={18}/> {response.error}
                    </div>
                  )}

                  {/* AI Executive Explanation */}
                  {response.explanation && !response.error && (
                    <div className="bg-[#05262c] border border-[#0d4750] p-4 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={14} className="text-[#00e5bf]"/>
                        <span className="text-xs font-bold text-[#00e5bf] uppercase tracking-wider font-mono">
                          AI Executive Synthesis
                        </span>
                      </div>
                      <p className="text-sm text-[#b2d5da] leading-relaxed">{response.explanation}</p>
                    </div>
                  )}

                  {/* KPI Metric Cards */}
                  {response.kpis && response.kpis.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {response.kpis.map((kpi, idx) => (
                        <div 
                          key={idx} 
                          className="bg-[#021417] border border-[#0d3b41] hover:border-[#00e5bf]/40 p-4 rounded-xl flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-md group"
                        >
                          <span className="text-[11px] text-[#6d949b] uppercase font-mono tracking-wider font-semibold mb-1 truncate">
                            {kpi.label}
                          </span>
                          <span className="text-2xl font-extrabold text-white font-mono truncate group-hover:text-[#00e5bf] transition-colors">
                            {kpi.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty Data State */}
                  {(!response.rows || response.rows.length === 0) && !response.error && (
                    <div className="p-12 text-center text-[#557a80] border border-[#0d3b41] border-dashed rounded-xl bg-[#021316]">
                      <TableIcon size={32} className="mx-auto mb-3 opacity-30 text-[#00e5bf]" />
                      No matching rows returned for this query.
                    </div>
                  )}

                  {/* Visuals & Data Table Grid */}
                  {response.rows && response.rows.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Plotly Chart Card */}
                      {response.chart ? (
                        <div className="bg-[#021417] border border-[#0d3b41] p-4 rounded-xl flex flex-col shadow-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 size={15} className="text-[#00e5bf]"/>
                            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
                              Interactive Visualization
                            </h4>
                          </div>
                          <div className="flex-1 w-full relative min-h-[350px]">
                            <Plot
                              data={response.chart.data}
                              layout={{
                                ...response.chart.layout,
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: '#b5d8de', family: 'Plus Jakarta Sans, sans-serif' }
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%', position: 'absolute' }}
                              config={{ displayModeBar: false, responsive: true }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#021417] border border-[#0d3b41] p-6 rounded-xl flex items-center justify-center text-[#567a80] text-xs italic font-mono">
                          Visualization not applicable for this data shape.
                        </div>
                      )}

                      {/* Results Data Table */}
                      <div className="bg-[#021417] border border-[#0d3b41] rounded-xl overflow-hidden flex flex-col h-[400px] shadow-xl">
                        <div className="flex items-center gap-2 p-3.5 border-b border-[#0d3b41] bg-[#03181c]">
                          <TableIcon size={15} className="text-[#00e5bf]"/>
                          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
                            Data Results
                          </h4>
                          <span className="ml-auto text-[11px] font-mono text-[#00e5bf] bg-[#00e5bf]/10 border border-[#00e5bf]/25 px-2 py-0.5 rounded-full">
                            {response.summary}
                          </span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                          <table className="w-full text-xs text-left font-mono">
                            <thead className="text-[11px] text-[#6d949b] uppercase bg-[#020f12] sticky top-0 border-b border-[#0d3b41]">
                              <tr>
                                {response.columns.map(c => (
                                  <th key={c} className="px-4 py-2.5 font-medium whitespace-nowrap">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#092c31]">
                              {response.rows.slice(0, 100).map((row, idx) => (
                                <tr key={idx} className="hover:bg-[#06282e]/60 transition-colors">
                                  {response.columns.map(c => (
                                    <td key={c} className="px-4 py-2 text-[#c2e4e8] whitespace-nowrap max-w-xs truncate">
                                      {row[c] !== null ? String(row[c]) : <span className="text-[#51767c] text-xs italic">NULL</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {response.rows.length > 100 && (
                          <div className="p-2 text-center text-[11px] text-[#557b81] border-t border-[#0d3b41] bg-[#020f12] font-mono">
                            Showing first 100 rows. (Paginated)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SQL Query Section */}
                  <div className="pt-2">
                    <button 
                      onClick={() => setShowSql(!showSql)}
                      className="flex items-center gap-2 text-xs font-mono text-[#6d949b] hover:text-[#00e5bf] transition-colors py-1.5"
                    >
                      <Code size={15} />
                      <span>{showSql ? 'Hide SQL Query' : 'View SQL Query'}</span>
                      {showSql ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    
                    {showSql && (
                      <div className="mt-2 bg-[#021316] border border-[#0d3b41] rounded-xl overflow-hidden animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between p-3 bg-[#031a1e] border-b border-[#0d3b41]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white font-semibold">Executed SQL</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${response.confidence > 0.8 ? 'bg-[#00e5bf]/15 text-[#00e5bf] border-[#00e5bf]/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                              {Math.round(response.confidence * 100)}% Confidence
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopySql(response.sql)}
                            className="flex items-center gap-1.5 text-xs text-[#00e5bf] hover:text-[#25f4d1] font-mono transition-colors"
                          >
                            {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                          </button>
                        </div>
                        <pre className="p-4 text-[#99f6e4] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-[#00e5bf]/30">
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
        
        {/* Bottom Input Area */}
        <div className="p-3.5 md:p-4 border-t border-[#0d3b41] bg-[#021316]/95 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              placeholder="Ask a question about your data..." 
              className="w-full bg-[#041d21] border border-[#0d3b41] rounded-xl pl-4 pr-32 py-3.5 text-white placeholder-[#557b81] focus:outline-none focus:border-[#00e5bf]/60 focus:ring-1 focus:ring-[#00e5bf]/60 transition-all disabled:opacity-50 text-sm md:text-base font-medium shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2.5 bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-xs md:text-sm shadow-md shadow-[#00e5bf]/25 disabled:opacity-40 disabled:hover:bg-[#00e5bf]"
            >
              <span>Ask AI</span>
              <Sparkles size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIQuery;
