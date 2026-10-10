import React from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-gray-400 mt-2">Manage workspace preferences and limits.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Application Preferences</h3>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Backend API URL</label>
              <input type="text" disabled value="http://localhost:8000" className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-gray-500 text-sm cursor-not-allowed" />
              <p className="text-xs text-gray-600 mt-1">Controlled by environment variables.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Default Currency</label>
              <select className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none">
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Timezone</label>
              <select className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1d27] border border-gray-800 rounded-xl overflow-hidden p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Query Limits</h3>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Max Rows Returned</label>
              <input type="number" defaultValue="1000" className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Statement Timeout (ms)</label>
              <input type="number" defaultValue="5000" className="w-full bg-[#14161f] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 flex items-start gap-4">
          <ShieldAlert className="text-red-400 shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Security Notice</h4>
            <p className="text-sm text-red-200/70">Database credentials and Gemini API keys are never exposed or editable in the frontend. Please modify the backend `.env` file directly to update secrets.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Save size={16} /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
