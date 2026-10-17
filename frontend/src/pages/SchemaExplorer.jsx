import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Database, RefreshCw, CheckCircle2, ChevronRight, Layers, Table as TableIcon } from 'lucide-react';

const SchemaExplorer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  const [expandedSchemas, setExpandedSchemas] = useState({});
  const [expandedTables, setExpandedTables] = useState({});

  const fetchSchema = async () => {
    try {
      const res = await api.get('/api/schema');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshStatus('Discovering schemas...');
    
    try {
      await new Promise(r => setTimeout(r, 600));
      setRefreshStatus('Detecting changes...');
      await new Promise(r => setTimeout(r, 600));
      setRefreshStatus('Updating FAISS vector index...');
      
      await api.post('/api/schema/refresh');
      await fetchSchema();
      
      setRefreshStatus('Completed');
      setTimeout(() => setRefreshStatus(''), 3000);
    } catch (e) {
      setRefreshStatus('Error refreshing schema.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSchema = (sName) => setExpandedSchemas(prev => ({...prev, [sName]: !prev[sName]}));
  const toggleTable = (sName, tName) => setExpandedTables(prev => ({...prev, [`${sName}.${tName}`]: !prev[`${sName}.${tName}`]}));

  return (
    <div className="max-w-[1240px] mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Schema Explorer</h2>
          <p className="text-[#6d949b] text-sm mt-1">Explore your database structure and AI embedding status.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {refreshStatus === 'Completed' && (
            <span className="text-[#00e5bf] text-xs font-mono flex items-center gap-1.5 bg-[#00e5bf]/10 px-3 py-1.5 rounded-full border border-[#00e5bf]/25">
              <CheckCircle2 size={14} /> Schema synchronized successfully.
            </span>
          )}
          {refreshStatus && refreshStatus !== 'Completed' && (
            <span className="text-[#00e5bf] text-xs font-mono animate-pulse">{refreshStatus}</span>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] font-bold px-4 py-2 rounded-xl text-xs md:text-sm shadow-md shadow-[#00e5bf]/25 transition-all disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Schema'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw size={32} className="animate-spin text-[#00e5bf]" />
          </div>
        ) : !data || data.schemas.length === 0 ? (
          <div className="text-center text-[#557a80] py-12 text-sm font-mono">No schema data found. Click Refresh to discover.</div>
        ) : (
          <div className="space-y-3">
            {data.schemas.map((schema) => (
              <div key={schema.name} className="bg-[#021316] border border-[#0d3b41] rounded-xl overflow-hidden">
                <div 
                  className="p-4 flex items-center cursor-pointer hover:bg-[#052227] transition-colors"
                  onClick={() => toggleSchema(schema.name)}
                >
                  <ChevronRight size={18} className={`text-[#5c8288] mr-2 transition-transform ${expandedSchemas[schema.name] ? 'rotate-90' : ''}`} />
                  <Layers size={18} className="text-[#00e5bf] mr-3" />
                  <span className="font-bold text-base text-white font-mono">{schema.name}</span>
                  <span className="ml-4 text-[11px] font-mono text-[#6c9197] bg-[#072d33] border border-[#0d454e] px-2.5 py-0.5 rounded-full">{schema.tables.length} tables</span>
                </div>
                
                {expandedSchemas[schema.name] && (
                  <div className="border-t border-[#0d3b41] p-3 space-y-2 bg-[#03181b]">
                    {schema.tables.map(table => {
                      const tKey = `${schema.name}.${table.name}`;
                      return (
                        <div key={table.name} className="ml-4 rounded-xl border border-[#0b3339] bg-[#021316] overflow-hidden">
                          <div 
                            className="p-3 flex items-center cursor-pointer hover:text-white text-gray-300 hover:bg-[#06262c] transition-colors"
                            onClick={() => toggleTable(schema.name, table.name)}
                          >
                            <ChevronRight size={14} className={`text-[#557b81] mr-2 transition-transform ${expandedTables[tKey] ? 'rotate-90' : ''}`} />
                            <TableIcon size={15} className="text-[#14b8a6] mr-2" />
                            <span className="font-mono text-sm font-medium">{table.name}</span>
                            <span className="ml-3 flex items-center gap-1 text-[10px] font-mono text-[#00e5bf] bg-[#00e5bf]/10 border border-[#00e5bf]/25 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11}/> AI Indexed
                            </span>
                          </div>
                          
                          {expandedTables[tKey] && (
                            <div className="p-3 bg-[#031518] border-t border-[#0b3339] grid grid-cols-1 md:grid-cols-2 gap-2">
                              {table.columns.map(col => (
                                <div key={col.name} className="flex justify-between items-center text-xs p-2 rounded-lg bg-[#041d21] border border-[#0a2e34]">
                                  <span className="text-white font-mono flex items-center gap-1.5">
                                    {col.is_primary_key && (
                                      <span className="text-[10px] font-bold text-[#00e5bf] bg-[#00e5bf]/15 px-1 py-0.2 rounded border border-[#00e5bf]/30">PK</span>
                                    )}
                                    {col.name}
                                  </span>
                                  <span className="text-[#6c9197] text-[11px] font-mono">{col.type} {col.nullable ? 'NULL' : 'NOT NULL'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
