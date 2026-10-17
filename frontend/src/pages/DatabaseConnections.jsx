import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link, Plus, Trash2, CheckCircle2, Play, AlertCircle, Database, Eye, EyeOff } from 'lucide-react';

const DatabaseConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(localStorage.getItem('active_connection_id') || '');
  const [showAdd, setShowAdd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [form, setForm] = useState({ name: '', url: '' });
  const [testStatus, setTestStatus] = useState('');
  
  const loadConnections = async () => {
    try {
      const res = await api.get('/api/connections');
      setConnections(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleActivate = (id) => {
    localStorage.setItem('active_connection_id', id);
    setActiveId(id);
    window.location.reload(); // Quick way to reset states globally
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/connections/${id}`);
      if (activeId === id) {
        localStorage.removeItem('active_connection_id');
        setActiveId('');
      }
      loadConnections();
    } catch (e) {}
  };

  const handleTest = async (e) => {
    e.preventDefault();
    setTestStatus('Testing connection...');
    const payload = { ...form, url: form.url.trim() };
    try {
      await api.post('/api/connections/test', payload);
      setTestStatus('Success');
    } catch (e) {
      if (e.response?.status === 404) {
        setTestStatus('Failed: 404 Not Found. Make sure the BizQuery AI backend (port 8000) is running, not another project!');
      } else {
        setTestStatus('Failed: ' + (e.response?.data?.detail || e.message));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, url: form.url.trim() };
    try {
      const res = await api.post('/api/connections', payload);
      handleActivate(res.data.id);
      setShowAdd(false);
      loadConnections();
    } catch (e) {
      if (e.response?.status === 404) {
        setTestStatus('Failed to save: 404 Not Found. Make sure the BizQuery AI backend (port 8000) is running.');
      } else {
        setTestStatus('Failed to save: ' + (e.response?.data?.detail || e.message));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Database Connections</h2>
          <p className="text-[#6d949b] text-sm mt-1">Manage and switch between PostgreSQL databases securely.</p>
        </div>
        {!showAdd && (
          <button 
            onClick={() => { setShowAdd(true); setTestStatus(''); }}
            className="bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] px-4 py-2 rounded-xl flex items-center gap-2 text-xs md:text-sm font-bold shadow-md shadow-[#00e5bf]/25 transition-all"
          >
            <Plus size={16} /> Add Database
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-[#041d21]/80 backdrop-blur-md border border-[#0d3b41] rounded-2xl p-6 shadow-2xl mb-6">
          <h3 className="text-base font-bold text-white mb-4 border-b border-[#0d3b41] pb-2">New Connection</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Connection Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="e.g. Sales Production DB" 
                className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-white placeholder-[#557a80] text-sm focus:border-[#00e5bf]/60 outline-none transition-colors" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">PostgreSQL Connection URL</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.url} 
                  onChange={e => setForm({...form, url: e.target.value})} 
                  placeholder="postgresql://user:pass@host:5432/db?sslmode=require" 
                  className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 pr-10 text-white placeholder-[#557a80] focus:border-[#00e5bf]/60 outline-none font-mono text-sm transition-colors" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d8288] hover:text-white"
                  title={showPassword ? "Hide URL" : "Show URL"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-[#52777d] mt-1.5">Supports Neon, Supabase, AWS RDS, or local PostgreSQL URLs.</p>
            </div>
            
            {testStatus && (
              <div className={`text-xs p-3 rounded-xl ${testStatus === 'Success' ? 'bg-[#00e5bf]/10 text-[#00e5bf] border border-[#00e5bf]/30' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {testStatus}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setShowAdd(false)} 
                className="px-4 py-2 text-xs text-[#6d949b] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleTest} 
                disabled={!form.name || !form.url} 
                className="bg-[#062429] hover:bg-[#09353c] text-white text-xs px-4 py-2 rounded-xl border border-[#0d3b41] disabled:opacity-50 transition-colors"
              >
                Test Connection
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={testStatus !== 'Success'} 
                className="bg-[#00e5bf] hover:bg-[#25f4d1] text-[#022125] font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-[#00e5bf]/25"
              >
                Save & Connect
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-[#557b81] p-8 text-center text-sm font-mono">Loading connections...</div>
        ) : connections.length === 0 && !showAdd ? (
          <div className="bg-[#041d21]/70 border border-[#0d3b41] border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <Link size={44} className="text-[#51767c] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No database connected</h3>
            <p className="text-[#6d949b] mb-6 max-w-sm text-sm">Add a PostgreSQL database to start exploring your schemas and executing AI queries.</p>
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all"
            >
              <Plus size={18} /> Add Database
            </button>
          </div>
        ) : (
          connections.map(conn => {
            const isActive = activeId === conn.id;
            return (
              <div 
                key={conn.id} 
                className={`bg-[#041d21]/75 backdrop-blur-md border ${
                  isActive ? 'border-[#00e5bf]/60 shadow-[0_0_20px_rgba(0,229,191,0.12)]' : 'border-[#0d3b41] hover:border-[#00e5bf]/30'
                } rounded-2xl p-4 md:p-5 flex items-center justify-between transition-all duration-200 shadow-xl`}
              >
                <div className="flex flex-col gap-1 truncate pr-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-white truncate">{conn.name}</h3>
                    {isActive ? (
                      <span className="text-[10px] font-mono font-bold text-[#00e5bf] bg-[#00e5bf]/15 border border-[#00e5bf]/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#6d949b] bg-[#062429] border border-[#0d3b41] px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6d949b] font-mono flex items-center gap-2 truncate">
                    <Database size={12} className="text-[#00e5bf] shrink-0"/> 
                    <span className="truncate">{conn.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isActive && (
                    <button 
                      onClick={() => handleActivate(conn.id)} 
                      className="bg-[#06292f] hover:bg-[#00e5bf] hover:text-[#022125] text-[#00e5bf] px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-[#0e4850] hover:border-transparent active:scale-95"
                    >
                      Activate
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(conn.id)} 
                    className="p-2 text-[#51767c] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" 
                    title="Delete Connection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DatabaseConnections;
