import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AIQuery from './pages/AIQuery';
import SchemaExplorer from './pages/SchemaExplorer';
import QueryHistory from './pages/QueryHistory';

import DatabaseConnections from './pages/DatabaseConnections';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="connections" element={<DatabaseConnections />} />
          <Route path="query" element={<AIQuery />} />
          <Route path="schema" element={<SchemaExplorer />} />
          <Route path="history" element={<QueryHistory />} />
          <Route path="settings" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
