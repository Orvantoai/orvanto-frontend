import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiSearch, FiMessageSquare, FiBookOpen, FiPlayCircle, FiChevronRight, FiSend } from 'react-icons/fi';

export default function Help() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      items: [
        { q: 'How do I set up my DNS records?', a: 'Go to Settings > Integrations to find your unique records. Add them to your domain host (like Hostinger or GoDaddy).' },
        { q: 'What is the 14-day warmup period?', a: 'We gradually increase your email volume to ensure your domain builds a positive reputation and your emails never hit spam.' }
      ]
    },
    {
      category: 'Outreach & Leads',
      items: [
        { q: 'How does the AI find leads?', a: 'Our AI analyzes your ICP (Ideal Customer Profile) and scans premium databases like Apollo and LinkedIn to find high-intent matches.' },
        { q: 'Can I use my own email accounts?', a: 'Yes, you can connect your own Google Workspace or Microsoft 365 accounts in the Outreach tab.' }
      ]
    },
    {
      category: 'Billing',
      items: [
        { q: 'How do I cancel my subscription?', a: 'You can manage your subscription under Settings > Billing. Cancellations take effect at the end of the current billing cycle.' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#030303] text-white font-outfit">
      <Sidebar clientId={clientId} active="Help" />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16 py-12 relative overflow-hidden rounded-[40px] bg-white/[0.02] border border-white/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-600/10 blur-[120px] -z-10"></div>
            
            <h1 className="text-5xl font-bold mb-6">How can we help?</h1>
            
            <div className="max-w-xl mx-auto px-6 relative">
              <FiSearch className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-purple-500 transition-all text-lg shadow-2xl"
              />
            </div>
          </section>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <FiBookOpen className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Documentation</h3>
              <p className="text-gray-400 text-sm">Detailed guides on every feature of Orvanto AI.</p>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <FiPlayCircle className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Video Tutorials</h3>
              <p className="text-gray-400 text-sm">Watch and learn how to scale your sales pipeline.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                <FiMessageSquare className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Support</h3>
              <p className="text-gray-400 text-sm">Chat with our experts 24/7 for technical help.</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-12 mb-16">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="grid gap-8">
              {faqs.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-purple-400 font-semibold tracking-wider uppercase text-sm">{cat.category}</h3>
                  <div className="grid gap-3">
                    {cat.items.map((item, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium group-hover:text-purple-400 transition-colors">{item.q}</h4>
                          <FiChevronRight className="text-gray-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <section className="p-10 rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden shadow-2xl shadow-purple-900/40">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h2 className="text-4xl font-bold mb-4">Still need help?</h2>
                <p className="text-purple-100">Our support team is here to help you win. Send us a message and we'll get back to you in under 2 hours.</p>
              </div>
              <button className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-xl">
                <FiSend />
                Message Support
              </button>
            </div>
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
          </section>
        </div>
      </main>
    </div>
  );
}
