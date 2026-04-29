import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { supabaseAdmin } from '../services/supabaseClient';
import { FiArrowLeft } from 'react-icons/fi';
import UsersTable from '../components/UsersTable';
import './ViewTenant.css';

export default function ViewTenant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const resp = await supabaseAdmin.from('Clients').select('*').eq('client_id', id).single();
        if (resp && resp.error) {
          console.warn('ViewTenant load error', resp.error);
          setTenant(null);
        } else {
          setTenant(resp.data || null);
        }
      } catch (e) {
        console.error('Failed to fetch tenant', e);
        setTenant(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadUsers() {
      if (!id) return;
      setUsersLoading(true);
      try {
        const r = await supabaseAdmin.from('Users').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(2000);
        if (r && r.error) {
          console.warn('Users load error', r.error);
          setUsers([]);
        } else {
          const mapped = (r.data || []).map(u => ({
            id: u.id || u.user_id || u.client_user_id,
            name: u.name || u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'User',
            email: u.email || u.contact_email || '',
            plan: u.plan || u.current_plan || '',
            status: u.status || (u.active ? 'Active' : 'Inactive') || 'Active',
            team: u.team || '',
            joinDate: u.created_at || u.joined_at,
            lastActive: u.last_active || u.last_sign_in_at || u.updated_at
          }));
          setUsers(mapped);
        }
      } catch (e) {
        console.error('Failed to load users', e);
        setUsers([]);
      }
      setUsersLoading(false);
    }
    loadUsers();
  }, [id]);

  const t = tenant || {
    name: 'Acme Corp',
    domain: 'acmecorp.com',
    contact_email: 'acme@example.com',
    phone: '+1 (555) 123-4567',
    plan: 'Enterprise',
    users_count: 1248,
    created_at: '2024-01-15T00:00:00Z',
    mrr: 24950,
    status: 'Active'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: 'var(--text)', display: 'flex' }}>
      <Sidebar active="Tenants" admin={true} compact={true} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <DashboardHeader showExport={false} showRefresh={false} loading={loading} />

        <div className="vt-container">
          <div className="vt-breadcrumbs">
            <div className="vt-breadcrumb-left">
              <Link to="/tenants" className="back-link" onClick={(e) => { /* keep link */ }}><FiArrowLeft style={{ marginRight: 8 }} /> Back to Tenants</Link>
              <div className="vt-title">View Tenant Details</div>
            </div>
            {/* <div>
              <button className="btn-ghost" onClick={() => navigate('/tenants')}>Back to Tenants</button>
            </div> */}
          </div>

          <div className="vt-hero card">
            <div className="vt-hero-left">
              <div className="vt-avatar">{(t.name||'AC').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
              <div className="vt-hero-meta">
                <div className="vt-name">{t.name}</div>
                <div className="vt-subline">{t.domain} &nbsp; · &nbsp; <a href={`mailto:${t.contact_email}`} className="muted-link">{t.contact_email}</a> &nbsp; · &nbsp; {t.phone}</div>
              </div>
            </div>

            <div className="vt-hero-right">
              <div className="vt-stats-row">
                <div className="vt-stat"><div className="vt-stat-label">Plan</div><div className="vt-stat-value"><span className="plan-pill small">{t.plan}</span></div></div>
                <div className="vt-stat"><div className="vt-stat-label">Users</div><div className="vt-stat-value">{(Number(t.users_count) || 0).toLocaleString()}</div></div>
                <div className="vt-stat"><div className="vt-stat-label">Joined On</div><div className="vt-stat-value">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</div></div>
                <div className="vt-stat"><div className="vt-stat-label">MRR</div><div className="vt-stat-value">${(Number(t.mrr)||0).toLocaleString()}</div></div>
              </div>
            </div>
          </div>

          <div className="vt-grid">
            <div className="vt-card card">
              <h4>Tenant Overview</h4>
              <div className="vt-overview-grid">
                <div><strong>Company Name</strong><div className="muted">{t.name}</div></div>
                <div><strong>Domain</strong><div className="muted">{t.domain}</div></div>
                <div><strong>Industry</strong><div className="muted">SaaS</div></div>
                <div><strong>Country</strong><div className="muted">United States</div></div>
                <div><strong>Owner</strong><div className="muted">John Doe (john@acmecorp.com)</div></div>
                <div><strong>Phone</strong><div className="muted">{t.phone}</div></div>
                <div><strong>Created On</strong><div className="muted">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</div></div>
                <div><strong>Status</strong><div className="status-badge active">{t.status}</div></div>
              </div>
            </div>

            <div className="vt-card card">
              <h4>Plan & Subscription</h4>
              <div style={{ marginTop: 8 }}>
                <div className="muted">Current Plan</div>
                <div style={{ marginTop: 6 }}><span className="plan-pill">{t.plan}</span></div>
                <div style={{ marginTop: 12 }}>
                  <div className="muted">Subscription Status</div>
                  <div style={{ marginTop: 6 }}><span className="status-badge active">Active</span></div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="muted">MRR</div>
                  <div style={{ marginTop: 6 }}>${(Number(t.mrr)||0).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="btn-outline" onClick={() => navigate(`/tenants/${id}/subscription`)}>Manage Subscription</button>
                </div>
              </div>
            </div>

            <div className="vt-card card">
              <h4>Tenant Actions</h4>
              <div className="vt-actions">
                <button className="vt-action vt-action-primary">Impersonate Tenant</button>
                <button className="vt-action vt-action-warn">Suspend Tenant</button>
                <button className="vt-action vt-action-danger">Delete Tenant</button>
              </div>
            </div>
          </div>

          <div className="vt-users card">
            {/* <div className="vt-users-header">
              <h4>Users</h4>
              <div className="vt-users-actions"><button className="btn-primary">+ Add User</button><button className="btn-ghost">View All Users</button></div>
            </div> */}
            <div className="vt-users-table-wrap">
              {usersLoading ? (
                <div className="muted" style={{ padding: 20 }}>Loading users...</div>
              ) : (
                <UsersTable users={users} />
              )}
            </div>
          </div>

          <div className="vt-bottom-grid">
            <div className="card vt-usage">
              <h4>Usage Overview</h4>
              <div className="muted">Email Credits</div>
              <div className="progress"><div className="progress-bar" style={{ width: '41%' }} /></div>
            </div>

            <div className="card vt-activity">
              <h4>Recent Activity</h4>
              <ul className="activity-list">
                <li>New user added by John Doe <span className="muted">• 2 mins ago</span></li>
                <li>Plan changed from Pro to Enterprise <span className="muted">• 1 hour ago</span></li>
              </ul>
            </div>

            <div className="card vt-billing">
              <h4>Billing History</h4>
              <ul className="billing-list muted">
                <li>INV-000124 — Jun 15, 2025 — $24,950 — <span className="status-badge paid">Paid</span></li>
                <li>INV-000123 — May 15, 2025 — $24,950 — <span className="status-badge paid">Paid</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
