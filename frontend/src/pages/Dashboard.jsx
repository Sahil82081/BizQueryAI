import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Database, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    schemas: 0,
    tables: 0,
    queriesRun: 0,
    insights: 0
  });
  
  const [recentQueries, setRecentQueries] = useState([]);

  useEffect(() => {
    // 1. Fetch real Schema Stats
    const fetchSchemaStats = async () => {
      try {
        const res = await api.get('/api/schema');
        const schemaData = res.data;
        if (schemaData && schemaData.schemas) {
          const schemaCount = schemaData.schemas.length;
          const tableCount = schemaData.schemas.reduce((acc, s) => acc + s.tables.length, 0);
          
          setStats(prev => ({ ...prev, schemas: schemaCount, tables: tableCount }));
        }
      } catch (e) {
        console.error("Could not load schema stats", e);
      }
    };

    // 2. Load real Query History from local storage
    const loadHistory = () => {
      try {
        const hist = JSON.parse(localStorage.getItem('bizquery_history') || '[]');
        const successful = hist.filter(h => h.status === 'Success').length;
        
        setStats(prev => ({ 
          ...prev, 
          queriesRun: hist.length,
          insights: successful // Treat successful queries as generated insights
        }));
        
        // Grab top 3 recent for the UI
        setRecentQueries(hist.slice(0, 3).map(h => h.question));
      } catch (e) {}
    };

    fetchSchemaStats();
    loadHistory();
  }, []);

  // Default suggested queries if history is empty
  const displayQueries = recentQueries.length > 0 
    ? recentQueries 
    : ['What was our revenue last month?', 'Compare revenue by category', 'Show daily sales for this week'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-gray-400 mt-2">Here's a quick overview of your workspace intelligence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Schemas', val: stats.schemas, icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Tables Indexed', val: stats.tables, icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Queries Run', val: stats.queriesRun, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Insights Generated', val: stats.insights, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-[#14161f] border border-gray-800 p-6 rounded-xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-gray-500 uppercase font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900/40 to-[#14161f] border border-blue-500/20 p-8 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Ask your data anything.</h2>
            <p className="text-blue-200/70 mb-6 max-w-sm">Use natural language to query metrics, visualize trends, and uncover hidden business insights.</p>
            <button onClick={() => navigate('/query')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              Start Query <ArrowRight size={18} />
            </button>
          </div>
          <Sparkles className="absolute -bottom-6 -right-6 text-blue-500/10 w-48 h-48" />
        </div>

        <div className="bg-[#14161f] border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Queries</h3>
          <div className="space-y-3">
            {displayQueries.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1a1d27] rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors" onClick={() => navigate('/query')}>
                <span className="text-sm text-gray-300 truncate max-w-[85%]">{q}</span>
                <ArrowRight size={14} className="text-gray-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
