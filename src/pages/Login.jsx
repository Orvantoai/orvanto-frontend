import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) throw loginErr;

      // Find the client_id associated with this email
      const { data: client, error: clientErr } = await supabase
        .from('Clients')
        .select('client_id')
        .eq('contact_email', email)
        .single();

      if (clientErr || !client) {
        // Fallback or default if no client record found
        navigate('/dashboard');
      } else {
        navigate(`/dashboard?client=${client.client_id}`);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-page contact-page" style={{ minHeight: '90vh' }}>
        <div className="contact-glow" style={{ background: 'radial-gradient(circle at top, rgba(168, 85, 247, 0.1), transparent 50%)' }} />
        
        <div className="signup-bg-text">LOGIN</div>

        <div className="container mx-auto px-6 max-w-lg pt-24 pb-32">
          <div className="signup-form-card contact-form-card animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 text-center">
              <Link to="/" className="inline-block mb-6">
                <img src="/favicon.svg" alt="Orvanto" className="w-12 h-12 mx-auto" />
              </Link>
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted">Enter your credentials to access your sales pipeline.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="field">
                <label className="required">Work Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="email" 
                    className="pl-12"
                    placeholder="john@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>

              <div className="field">
                <label className="required">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="password" 
                    className="pl-12"
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-white transition-colors">
                  <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                  Remember me
                </label>
                <Link to="/contact" className="text-[var(--purple)] hover:underline">Forgot password?</Link>
              </div>

              <button 
                type="submit" 
                className="btn-submit-new w-full py-4 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    Sign In <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-muted text-sm">
                Don't have an account? <Link to="/signup" className="text-white font-bold hover:text-[var(--purple)] transition-colors">Start Free Trial</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
