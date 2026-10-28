import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Database, History } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/query', icon: MessageSquare, label: 'AI Query' },
    { to: '/schema', icon: Database, label: 'Schema Explorer' },
    { to: '/history', icon: History, label: 'Query History' },

  ];

  return (
    <div className="w-64 bg-[#0f1117] h-screen flex flex-col border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tight">BizQuery AI</h1>
        <p className="text-xs text-gray-400 mt-1">Natural-Language BI Agent</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-200">User</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
