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
      // Simulate UX progress steps before calling API for effect
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
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Schema Explorer</h2>
          <p className="text-gray-400 mt-1">Explore your database structure and AI embedding status.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {refreshStatus === 'Completed' && (
            <span className="text-green-400 text-sm flex items-center gap-1 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
              <CheckCircle2 size={16} /> Schema synchronized successfully.
            </span>
          )}
          {refreshStatus && refreshStatus !== 'Completed' && (
            <span className="text-blue-400 text-sm animate-pulse">{refreshStatus}</span>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#252a36] hover:bg-[#2d3342] text-white px-4 py-2 rounded-lg border border-gray-700 transition-all disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Schema'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden shadow-xl p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw size={32} className="animate-spin text-gray-500" />
          </div>
        ) : !data || data.schemas.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No schema data found. Click Refresh to discover.</div>
        ) : (
          <div className="space-y-4">
            {data.schemas.map((schema) => (
              <div key={schema.name} className="bg-[#14161f] border border-gray-800 rounded-lg overflow-hidden">
                <div 
                  className="p-4 flex items-center cursor-pointer hover:bg-[#1a1d27] transition-colors"
                  onClick={() => toggleSchema(schema.name)}
                >
                  <ChevronRight size={18} className={`text-gray-500 mr-2 transition-transform ${expandedSchemas[schema.name] ? 'rotate-90' : ''}`} />
                  <Layers size={20} className="text-purple-400 mr-3" />
                  <span className="font-semibold text-lg text-white">{schema.name}</span>
                  <span className="ml-4 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{schema.tables.length} tables</span>
                </div>
                
                {expandedSchemas[schema.name] && (
                  <div className="border-t border-gray-800 p-2 bg-[#0f1117]">
                    {schema.tables.map(table => {
                      const tKey = `${schema.name}.${table.name}`;
                      return (
                        <div key={table.name} className="ml-8 mb-2">
                          <div 
                            className="p-2 flex items-center cursor-pointer hover:text-white text-gray-300 rounded hover:bg-[#1a1d27]"
                            onClick={() => toggleTable(schema.name, table.name)}
                          >
                            <ChevronRight size={14} className={`text-gray-500 mr-2 transition-transform ${expandedTables[tKey] ? 'rotate-90' : ''}`} />
                            <TableIcon size={16} className="text-blue-400 mr-2" />
                            <span className="font-medium">{table.name}</span>
                            <span className="ml-3 flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded">
                              <CheckCircle2 size={10}/> AI Indexed
                            </span>
                          </div>
                          
                          {expandedTables[tKey] && (
                            <div className="ml-8 mt-1 p-3 bg-[#14161f] rounded border border-gray-800 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                              {table.columns.map(col => (
                                <div key={col.name} className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-1">
                                  <span className="text-gray-400 flex items-center gap-2">
                                    {col.is_primary_key && <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1 rounded">PK</span>}
                                    {col.name}
                                  </span>
                                  <span className="text-gray-600 text-xs font-mono">{col.type} {col.nullable ? 'NULL' : 'NOT NULL'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
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
