import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, Check } from 'lucide-react';

const Settings = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Settings</h2>
        <p className="text-[#6d949b] text-sm mt-1">Manage workspace preferences and limits.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 border-b border-[#0d3b41] pb-2">Application Preferences</h3>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Backend API URL</label>
              <input 
                type="text" 
                disabled 
                value={import.meta.env.VITE_API_URL || 'http://localhost:8000'} 
                className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-[#51767c] text-xs cursor-not-allowed font-mono" 
              />
              <p className="text-[11px] text-[#51767c] mt-1">Controlled by VITE_API_URL environment variable.</p>
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Default Currency</label>
              <select className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-white text-xs focus:border-[#00e5bf]/60 outline-none transition-colors">
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Timezone</label>
              <select className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-white text-xs focus:border-[#00e5bf]/60 outline-none transition-colors">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#041d21]/75 backdrop-blur-md border border-[#0d3b41] rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 border-b border-[#0d3b41] pb-2">Query Limits</h3>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Max Rows Returned</label>
              <input 
                type="number" 
                defaultValue="1000" 
                className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-white text-xs focus:border-[#00e5bf]/60 outline-none font-mono transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6d949b] mb-1.5">Statement Timeout (ms)</label>
              <input 
                type="number" 
                defaultValue="5000" 
                className="w-full bg-[#021316] border border-[#0d3b41] rounded-xl p-2.5 text-white text-xs focus:border-[#00e5bf]/60 outline-none font-mono transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={22} />
          <div>
            <h4 className="text-red-400 font-bold text-xs uppercase tracking-wide mb-1">Security Notice</h4>
            <p className="text-xs text-red-200/70 leading-relaxed">
              Database credentials and Gemini API keys are never exposed or editable in the frontend. Please modify the backend <code className="text-[#00e5bf]">.env</code> file directly to update secrets.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-[#00e5bf] hover:bg-[#25f4d1] active:scale-95 text-[#022125] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-md shadow-[#00e5bf]/25 transition-all"
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            <span>{saved ? 'Preferences Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
