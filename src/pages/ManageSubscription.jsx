import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { supabaseAdmin } from '../services/supabaseClient';
import { FiArrowLeft } from 'react-icons/fi';
import './ManageSubscription.css';

const basePlans = [
  { id: 'starter', name: 'Starter', monthly: 0, features: ['1,000 Emails / month','1 User','1 Pipeline','5,000 Leads','Email Support'] },
  { id: 'growth', name: 'Growth', monthly: 149, features: ['10,000 Emails / month','5 Users','5 Pipelines','50,000 Leads','Priority Support'] },
  { id: 'pro', name: 'Pro', monthly: 349, features: ['25,000 Emails / month','16 Users','15 Pipelines','150,000 Leads','Priority Support, Reporting'] },
  { id: 'enterprise', name: 'Enterprise', monthly: 999, features: ['Unlimited Emails','Unlimited Users','Unlimited Pipelines','Unlimited Leads','Dedicated Account Manager'] }
];

function yearly(price) { return Math.round(price * 12 * 0.8); }

export default function ManageSubscription(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans] = useState(basePlans);
  const [currentPlan, setCurrentPlan] = useState('enterprise');

  useEffect(() => {
    async function load(){
      if(!id) return;
      setLoading(true);
      try{
        const resp = await supabaseAdmin.from('Clients').select('*').eq('client_id', id).single();
        if(resp && resp.error){ console.warn('client load error', resp.error); setTenant(null); }
        else { setTenant(resp.data || null); if(resp.data && resp.data.plan) setCurrentPlan((resp.data.plan||'').toString().toLowerCase()); }
      }catch(e){ console.error(e); setTenant(null); }
      setLoading(false);
    }
    load();
  }, [id]);

  const t = tenant || { name: 'Acme Corp', domain: 'acmecorp.com', contact_email: 'acme@example.com', phone: '+1 (555) 123-4567', plan: 'Enterprise', users_count: 1248, created_at: '2024-01-15T00:00:00Z', mrr: 24950, status: 'Active' };

  const handleSelectPlan = (planId) => {
    if(planId === currentPlan) return;
    // placeholder: show confirmation and update locally
    if(confirm(`Change plan to ${planId}?`)){
      setCurrentPlan(planId);
      alert('Plan updated (local only).');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Tenants" admin={true} compact={true} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={false} showRefresh={false} loading={loading} />

        <div className="ms-container">
          <div className="ms-breadcrumbs">
            <div className="ms-breadcrumb-left">
              <Link to={`/tenants/${id}`} className="back-link"><FiArrowLeft style={{ marginRight: 8 }} /> Back to Tenant</Link>
              <div className="ms-title">Manage Subscription</div>
            </div>
            <div />
          </div>

          <div className="ms-hero card">
            <div className="ms-hero-left">
              <div className="ms-avatar">{(t.name||'AC').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
              <div className="ms-hero-meta">
                <div className="ms-name">{t.name} <span className="status-badge active">{t.status}</span></div>
                <div className="ms-subline">{t.domain} · <a href={`mailto:${t.contact_email}`} className="muted-link">{t.contact_email}</a> · {t.phone}</div>
              </div>
            </div>

            <div className="ms-hero-right">
              <div className="ms-hero-stats">
                <div><strong>Current Plan</strong><div className="muted">{(t.plan || currentPlan).toString()}</div></div>
                <div><strong>MRR</strong><div className="muted">${(Number(t.mrr)||0).toLocaleString()}</div></div>
                <div><strong>Users</strong><div className="muted">{(Number(t.users_count)||0).toLocaleString()}</div></div>
                <div><strong>Next Billing Date</strong><div className="muted">Jul 15, 2025</div></div>
              </div>
            </div>
          </div>

          <div className="ms-grid">
            <div className="ms-left">
              <section className="ms-section card">
                <div className="ms-section-header"><h3>1. Choose Plan</h3>
                  <div className="ms-toggle"><label className={`ms-toggle-item ${billingCycle==='monthly'?'active':''}`} onClick={() => setBillingCycle('monthly')}>Monthly</label><label className={`ms-toggle-item ${billingCycle==='yearly'?'active':''}`} onClick={() => setBillingCycle('yearly')}>Yearly <span className="ms-save">Save 20%</span></label></div>
                </div>

                <div className="ms-plans-grid">
                  {plans.map(p => {
                    const price = billingCycle === 'monthly' ? p.monthly : yearly(p.monthly);
                    const isCurrent = currentPlan && currentPlan.toLowerCase().includes(p.id);
                    return (
                      <div key={p.id} className={`ms-plan-card ${isCurrent ? 'current' : ''}`} onClick={() => handleSelectPlan(p.id)}>
                        <div className="ms-plan-head"><div className="ms-plan-name">{p.name}</div><div className="ms-plan-price">{price === 0 ? 'Free' : `$${price}${billingCycle==='monthly'?'/mo':'/yr'}`}</div></div>
                        <ul className="ms-plan-features">
                          {p.features.map((f,i) => <li key={i}>{f}</li>)}
                        </ul>
                        <div className="ms-plan-cta">
                          {isCurrent ? <button className="btn-ghost" disabled>Current Plan</button> : <button className="btn-primary" onClick={(e)=>{e.stopPropagation(); handleSelectPlan(p.id);}}>Upgrade</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="ms-section card ms-usage">
                <h3>2. Plan Limits & Usage</h3>
                <div className="ms-usage-table">
                  {[
                    { label: 'Emails Sent', used: 208732, limit: 500000 },
                    { label: 'LinkedIn Invites', used: 12450, limit: 25000 },
                    { label: 'Warmup Slots', used: 8, limit: 10 },
                    { label: 'Users', used: t.users_count || 1248, limit: 'Unlimited' },
                    { label: 'Pipelines', used: 15, limit: 'Unlimited' },
                    { label: 'Leads', used: 320450, limit: 'Unlimited' },
                    { label: 'Storage', used: 120, limit: '500 GB' }
                  ].map((r,idx) => {
                    const pct = typeof r.limit === 'number' ? Math.min(100, Math.round((r.used / r.limit) * 100)) : Math.min(100, Math.round((Number(r.used) || 0) / (Number(r.used) + 100) * 100));
                    return (
                      <div className="ms-usage-row" key={idx}>
                        <div className="ms-usage-label">{r.label}</div>
                        <div className="ms-usage-bar"><div className="ms-usage-fill" style={{ width: `${pct}%` }} /></div>
                        <div className="ms-usage-values">{r.used.toLocaleString ? r.used.toLocaleString() : r.used} <span className="muted">/ {r.limit}</span></div>
                      </div>
                    );
                  })}
                </div>
                <div className="ms-usage-note">Need custom limits or a custom plan? <button className="btn-ghost">Contact Sales</button></div>
              </section>

              <section className="ms-section card ms-actions">
                <h3>3. Billing & Subscription Actions</h3>
                <div className="ms-action-cards">
                  <div className="ms-action-card"><div className="ms-action-title">Change Billing Cycle</div><div className="ms-action-desc">Switch between monthly or yearly billing.</div><button className="btn-ghost">Change</button></div>
                  <div className="ms-action-card"><div className="ms-action-title">Update Payment Method</div><div className="ms-action-desc">Update your card or payment details.</div><button className="btn-ghost">Update</button></div>
                  <div className="ms-action-card"><div className="ms-action-title">Apply Coupon</div><div className="ms-action-desc">Have a coupon code? Apply now.</div><button className="btn-ghost">Apply</button></div>
                  <div className="ms-action-card danger"><div className="ms-action-title">Cancel Subscription</div><div className="ms-action-desc">Cancel your subscription at period end.</div><button className="btn-danger">Cancel</button></div>
                </div>
              </section>
            </div>

            <aside className="ms-right">
              <div className="ms-summary card">
                <h4>Subscription Summary</h4>
                <div className="ms-summary-row"><strong>Current Plan</strong><div className="muted">{currentPlan}</div></div>
                <div className="ms-summary-row"><strong>Status</strong><div className="muted">Active</div></div>
                <div className="ms-summary-row"><strong>Billing Cycle</strong><div className="muted">{billingCycle}</div></div>
                <div className="ms-summary-row"><strong>MRR</strong><div className="muted">${(Number(t.mrr)||0).toLocaleString()}</div></div>
                <div style={{ marginTop: 12 }}><button className="btn-primary" style={{ width: '100%' }}>Update Subscription</button></div>
              </div>

              <div className="ms-billing card">
                <h4>Billing History</h4>
                <ul className="ms-invoices">
                  <li><span>INV-000124</span><span>Jun 15, 2025</span><span>$24,950</span><span className="status-badge paid">Paid</span></li>
                  <li><span>INV-000123</span><span>May 15, 2025</span><span>$24,950</span><span className="status-badge paid">Paid</span></li>
                </ul>
                <div style={{ marginTop: 8 }}><button className="btn-ghost">View All Invoices</button></div>
              </div>

              <div className="ms-payment card">
                <h4>Payment Method</h4>
                <div className="ms-payment-row">
                  <div>Visa ending in 4242</div>
                  <div className="muted">Expires 04/28</div>
                </div>
                <div style={{ marginTop: 8 }}><button className="btn-ghost">Edit</button> <button className="btn-ghost">Add New Payment Method</button></div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
