import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import { FiUser, FiSettings, FiCreditCard, FiKey, FiBell, FiShield, FiSave } from 'react-icons/fi';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    website: '',
    instantly_api_key: '',
    vapi_assistant_id: '',
    plan: 'starter'
  });

  useEffect(() => {
    async function fetchClient() {
      if (!clientId) return;
      const { data, error } = await supabase
        .from('Clients')
        .select('*')
        .eq('client_id', clientId)
        .single();
      
      if (data) setClientData(data);
      setLoading(false);
    }
    fetchClient();
  }, [clientId]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('Clients')
      .update(clientData)
      .eq('client_id', clientId);
    
    if (error) alert('Error saving settings');
    else alert('Settings updated successfully');
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: FiUser },
    { id: 'integrations', label: 'Integrations', icon: FiKey },
    { id: 'billing', label: 'Billing & Plan', icon: FiCreditCard },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  return (
    <div className="flex min-h-screen bg-[#030303] text-white font-outfit">
      <Sidebar clientId={clientId} active="Settings" />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">
              Settings
            </h1>
            <p className="text-gray-400">Manage your account preferences and system configurations.</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <aside className="lg:w-64 flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10"></div>
              
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Company Name</label>
                      <input 
                        type="text" 
                        value={clientData.name}
                        onChange={(e) => setClientData({...clientData, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Website</label>
                      <input 
                        type="text" 
                        value={clientData.website}
                        onChange={(e) => setClientData({...clientData, website: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Contact Person</label>
                      <input 
                        type="text" 
                        value={clientData.contact_name}
                        onChange={(e) => setClientData({...clientData, contact_name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Contact Email</label>
                      <input 
                        type="email" 
                        value={clientData.contact_email}
                        readOnly
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-6">
                    <h3 className="text-blue-400 font-semibold mb-1 flex items-center gap-2">
                      <FiKey /> API Configuration
                    </h3>
                    <p className="text-sm text-blue-400/70">These keys are required for automated outreach and AI voice agents.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Instantly.ai API Key</label>
                      <input 
                        type="password" 
                        placeholder="Paste your API key here"
                        value={clientData.instantly_api_key}
                        onChange={(e) => setClientData({...clientData, instantly_api_key: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Vapi Assistant ID</label>
                      <input 
                        type="text" 
                        value={clientData.vapi_assistant_id}
                        onChange={(e) => setClientData({...clientData, vapi_assistant_id: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-purple-900/20">
                    <div className="relative z-10">
                      <p className="text-purple-100 text-sm font-medium mb-1 uppercase tracking-wider">Current Plan</p>
                      <h2 className="text-3xl font-bold mb-4 capitalize">{clientData.plan} Plan</h2>
                      <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                        Upgrade Plan
                      </button>
                    </div>
                    <FiCreditCard className="absolute bottom-[-20px] right-[-20px] text-[150px] text-white/10 rotate-12" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Billing History</h3>
                    <div className="text-gray-400 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">
                      No recent invoices found.
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
