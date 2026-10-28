import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Database, History, LogOut, Code2, Link as LinkIcon } from 'lucide-react';

const MainLayout = () => {
  const navigate = useNavigate();
  const activeConn = localStorage.getItem('active_connection_id');
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Connections', path: '/connections', icon: LinkIcon },
    { name: 'AI Query', path: '/query', icon: Sparkles },
    { name: 'Schema Explorer', path: '/schema', icon: Database },
    { name: 'History', path: '/history', icon: History },

  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      <aside className="w-64 bg-[#14161f] border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 text-blue-500 font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <Code2 size={20} />
            </div>
            BizQuery AI
          </div>
          {activeConn ? (
            <div className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mt-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> DB Connected
            </div>
          ) : (
            <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mt-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> No DB Connected
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1d27] border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
