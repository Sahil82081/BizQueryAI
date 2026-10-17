import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Database, History, Settings } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/query', icon: Sparkles, label: 'AI Query' },
    { to: '/schema', icon: Database, label: 'Schema Explorer' },
    { to: '/history', icon: History, label: 'Query History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-[#021316] h-screen flex flex-col border-r border-[#0a282d] select-none">
      <div className="p-6">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#00e5bf] flex items-center justify-center text-[#022125] text-xs font-bold">
            BQ
          </span>
          BizQuery AI
        </h1>
        <p className="text-xs text-[#6d949b] mt-1 font-mono">Natural-Language BI Agent</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#062c32] text-[#00e5bf] border border-[#0d4f58] shadow-sm font-semibold' 
                  : 'text-[#6d949b] hover:bg-[#042025] hover:text-white border border-transparent'
              }`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-[#0a282d] bg-[#020f12]">
        <div className="flex items-center space-x-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00e5bf] to-[#0ea5e9] flex items-center justify-center text-[#022125] font-bold text-xs">
            AV
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Alex Vance</p>
            <p className="text-[10px] text-[#557c82]">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
