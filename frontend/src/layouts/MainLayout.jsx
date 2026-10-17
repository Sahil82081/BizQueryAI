import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Database, History, Settings, Code2, Link as LinkIcon, Menu, X } from 'lucide-react';

const MainLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeConn = localStorage.getItem('active_connection_id');
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Connections', path: '/connections', icon: LinkIcon },
    { name: 'AI Query', path: '/query', icon: Sparkles },
    { name: 'Schema Explorer', path: '/schema', icon: Database },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#031517] text-[#e6f6f5] flex font-sans selection:bg-[#00e5bf]/20 selection:text-[#00e5bf]">
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#021316]/90 backdrop-blur-md border-b border-[#0a282d] z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-[#00e5bf] flex items-center justify-center text-[#022125] shadow-[0_0_12px_rgba(0,229,191,0.3)]">
            <Sparkles size={17} />
          </div>
          <span className="font-bold text-white text-base tracking-tight">BizQuery AI</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-1.5 rounded-lg text-[#6d949a] hover:text-white"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#021316] border-r border-[#0a282d] flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { navigate('/'); setMobileOpen(false); }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e5bf] to-[#0ea5e9] flex items-center justify-center text-[#022125] shadow-[0_0_18px_rgba(0,229,191,0.25)] group-hover:scale-105 transition-transform duration-200">
              <Sparkles size={18} className="text-[#021f23]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-lg tracking-tight">BizQuery</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#062c32] text-[#00e5bf] border border-[#0d4f58]">AI</span>
              </div>
            </div>
          </div>

          {activeConn ? (
            <div className="text-[10px] text-[#00e5bf] font-mono font-semibold uppercase tracking-wider mt-3 flex items-center gap-1.5 bg-[#00e5bf]/10 border border-[#00e5bf]/25 px-2.5 py-1 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5bf] animate-pulse"></span> DB Connected
            </div>
          ) : (
            <div className="text-[10px] text-red-400 font-mono font-semibold uppercase tracking-wider mt-3 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> No DB Connected
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#062c32] text-[#00e5bf] border border-[#0d4f58] shadow-[0_0_12px_rgba(0,229,191,0.06)] font-semibold' 
                      : 'text-[#6d949b] hover:text-white hover:bg-[#042025] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-[#00e5bf]' : 'group-hover:text-white transition-colors'} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e5bf] shadow-[0_0_6px_#00e5bf]"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#0a282d] bg-[#020f12]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00e5bf] to-[#0284c7] flex items-center justify-center text-[#021f22] font-bold text-xs">
              AV
            </div>
            <div className="text-xs">
              <div className="font-medium text-white">Alex Vance</div>
              <div className="text-[10px] text-[#557c82]">Workspace Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0 bg-[#031517]">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
