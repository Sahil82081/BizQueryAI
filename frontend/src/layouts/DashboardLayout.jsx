import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 border-l border-gray-800 bg-[#14161f]">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
