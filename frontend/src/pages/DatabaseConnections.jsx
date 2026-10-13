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
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Database Connections</h2>
          <p className="text-gray-400 mt-2">Manage and switch between PostgreSQL databases securely.</p>
        </div>
        {!showAdd && (
          <button 
            onClick={() => { setShowAdd(true); setTestStatus(''); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Database
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 shadow-xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">New Connection</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Connection Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Sales Production DB" className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">PostgreSQL Connection URL</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.url} 
                  onChange={e => setForm({...form, url: e.target.value})} 
                  placeholder="postgresql://user:pass@host:5432/db?sslmode=require" 
                  className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 pr-10 text-white focus:border-blue-500 outline-none font-mono text-sm" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  title={showPassword ? "Hide URL" : "Show URL"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Supports Neon, Supabase, AWS RDS, or local PostgreSQL URLs.</p>
            </div>
            
            {testStatus && (
              <div className={`text-sm p-3 rounded-lg ${testStatus === 'Success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {testStatus}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="button" onClick={handleTest} disabled={!form.name || !form.url} className="bg-[#252a36] hover:bg-[#2d3342] text-white px-4 py-2 rounded-lg border border-gray-700 disabled:opacity-50">Test Connection</button>
              <button type="button" onClick={handleSave} disabled={testStatus !== 'Success'} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">Save & Connect</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-500 p-8 text-center">Loading connections...</div>
        ) : connections.length === 0 && !showAdd ? (
          <div className="bg-[#1a1d27] border border-gray-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Link size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No database connected</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Add a PostgreSQL database to start exploring your schemas and executing AI queries.</p>
            <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus size={18} /> Add Database
            </button>
          </div>
        ) : (
          connections.map(conn => {
            const isActive = activeId === conn.id;
            return (
              <div key={conn.id} className={`bg-[#1a1d27] border ${isActive ? 'border-blue-500' : 'border-gray-800'} rounded-xl p-5 flex items-center justify-between transition-all shadow-lg`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-white">{conn.name}</h3>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-[#252a36] border border-gray-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Saved</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                    <Database size={12}/> {conn.url}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button onClick={() => handleActivate(conn.id)} className="bg-[#252a36] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 hover:border-transparent">
                      Activate
                    </button>
                  )}
                  <button onClick={() => handleDelete(conn.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Connection">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default DatabaseConnections;
