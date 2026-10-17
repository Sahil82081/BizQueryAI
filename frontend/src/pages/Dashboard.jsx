import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Database, TrendingUp, Layers } from 'lucide-react';
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
          insights: successful
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
    <div className="max-w-[1240px] mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
        <p className="text-[#6d949b] text-sm mt-1">Here's a quick overview of your workspace intelligence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Schemas', val: stats.schemas, icon: Database, color: 'text-[#00e5bf]', bg: 'bg-[#00e5bf]/10' },
          { label: 'Tables Indexed', val: stats.tables, icon: Layers, color: 'text-[#14b8a6]', bg: 'bg-[#14b8a6]/10' },
          { label: 'Queries Run', val: stats.queriesRun, icon: Sparkles, color: 'text-[#5eead4]', bg: 'bg-[#5eead4]/10' },
          { label: 'Insights Generated', val: stats.insights, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((s, i) => (
          <div 
            key={i} 
            className="bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] hover:border-[#00e5bf]/40 p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 shadow-xl group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color} transition-transform duration-200 group-hover:scale-105`}>
              <s.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white font-mono">{s.val}</div>
              <div className="text-[11px] text-[#6d949b] uppercase font-mono tracking-wider font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#06353d]/90 to-[#031c20] border border-[#00e5bf]/30 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00e5bf]/15 text-[#00e5bf] border border-[#00e5bf]/30 text-xs font-mono mb-4">
              <Sparkles size={12} /> Natural Language Querying
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ask your data anything.</h2>
            <p className="text-[#8eb8be] mb-6 max-w-sm text-sm leading-relaxed">
              Use natural language to query metrics, visualize trends, and uncover hidden business insights.
            </p>
            <button 
              onClick={() => navigate('/query')} 
              className="bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-[#00e5bf]/25"
            >
              Start Query <ArrowRight size={16} />
            </button>
          </div>
          <Sparkles className="absolute -bottom-8 -right-8 text-[#00e5bf]/10 w-56 h-56 pointer-events-none" />
        </div>

        <div className="bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 tracking-tight">Recent Queries</h3>
          <div className="space-y-2.5">
            {displayQueries.map((q, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3.5 bg-[#021316] rounded-xl border border-[#0d3b41] hover:border-[#00e5bf]/40 hover:bg-[#052227] cursor-pointer transition-all duration-200 group" 
                onClick={() => navigate('/query')}
              >
                <div className="flex items-center gap-2.5 truncate max-w-[85%]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5bf] shrink-0"></span>
                  <span className="text-xs text-[#9bbec4] group-hover:text-white truncate font-medium">{q}</span>
                </div>
                <ArrowRight size={14} className="text-[#51747a] group-hover:text-[#00e5bf] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
