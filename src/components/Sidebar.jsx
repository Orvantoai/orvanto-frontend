import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
  FiHome, FiUsers, FiCalendar, FiMail, FiDollarSign, FiLogOut, FiBarChart2, FiZap,
  FiExternalLink, FiSettings, FiHelpCircle, FiUser, FiCreditCard, FiTag, FiKey,
  FiGlobe, FiEdit, FiFileText, FiArchive, FiBell, FiActivity
} from 'react-icons/fi';
import '../pages/Dashboard.css';

export default function Sidebar({ client, clientId, active = 'Overview', admin = false, compact = false }) {
  const navigate = useNavigate();
  const linkPath = (p) => (clientId ? `${p}?client=${clientId}` : p);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const adminGroups = [
    { title: null, items: [ { icon: FiHome, label: 'Overview', display: 'Dashboard', path: linkPath('/dashboard'), color: 'var(--purple)' } ] },
    { title: 'ANALYTICS', items: [
      { icon: FiBarChart2, label: 'Platform Analytics', path: linkPath('/platform-analytics') },
      { icon: FiFileText, label: 'Reports', path: linkPath('/reports') }
    ] },
    { title: 'TENANT MANAGEMENT', items: [
      { icon: FiUsers, label: 'Tenants', path: linkPath('/tenants') },
      { icon: FiCreditCard, label: 'Subscriptions', path: linkPath('/subscriptions') },
      { icon: FiTag, label: 'Plans & Pricing', path: linkPath('/plans') },
      { icon: FiSettings, label: 'Feature Controls', path: linkPath('/feature-controls') },
    ]},
    { title: 'USER MANAGEMENT', items: [
      { icon: FiUser, label: 'All Users', path: linkPath('/users') },
      { icon: FiKey, label: 'Roles & Permissions', path: linkPath('/roles') },
      { icon: FiUsers, label: 'Teams', path: linkPath('/teams') },
    ]},
    { title: 'PLATFORM MANAGEMENT', items: [
      { icon: FiUsers, label: 'Leads (Global)', path: linkPath('/leads') },
      { icon: FiMail, label: 'Outreach Campaigns', path: linkPath('/outreach') },
      { icon: FiZap, label: 'Pipelines', path: linkPath('/pipelines') },
      { icon: FiCalendar, label: 'Meetings', path: linkPath('/meetings') },
      { icon: FiGlobe, label: 'Warmup Domains', path: linkPath('/warmup-domains') },
    ]},
    { title: 'CONFIGURATIONS', items: [
      { icon: FiMail, label: 'Email Accounts (SMTP)', path: linkPath('/email-accounts') },
      { icon: FiExternalLink, label: 'Integrations', path: linkPath('/integrations') },
      { icon: FiEdit, label: 'Custom Fields', path: linkPath('/custom-fields') },
      { icon: FiTag, label: 'Tags & Labels', path: linkPath('/tags') },
      { icon: FiZap, label: 'Automation Rules', path: linkPath('/automation') },
      { icon: FiBell, label: 'Notifications', path: linkPath('/notifications') },
    ]},
    { title: 'BILLING & FINANCE', items: [
      { icon: FiCreditCard, label: 'Payments', path: linkPath('/payments') },
      { icon: FiFileText, label: 'Invoices', path: linkPath('/invoices') },
      { icon: FiDollarSign, label: 'Revenue & Payouts', path: linkPath('/revenue') },
      { icon: FiArchive, label: 'Credits & Usage', path: linkPath('/credits') },
    ]},
    { title: 'SYSTEM', items: [
      { icon: FiFileText, label: 'Audit Logs', path: linkPath('/audit-logs') },
      { icon: FiFileText, label: 'Error Logs', path: linkPath('/error-logs') },
      { icon: FiActivity, label: 'Activity Logs', path: linkPath('/activity-logs') },
      { icon: FiSettings, label: 'System Settings', path: linkPath('/system-settings') },
    ]}
  ];

  // Compact admin sidebar — only core admin pages
  const compactAdminGroups = [
    { title: null, items: [ { icon: FiHome, label: 'Overview', display: 'Dashboard', path: linkPath('/dashboard'), color: 'var(--purple)' } ] },
    { title: 'TENANT MANAGEMENT', items: [
      { icon: FiUsers, label: 'Tenants', path: linkPath('/tenants') },
      { icon: FiCreditCard, label: 'Subscriptions', path: linkPath('/subscriptions') }
    ]},
    { title: 'ANALYTICS', items: [
      { icon: FiBarChart2, label: 'Platform Analytics', path: linkPath('/platform-analytics') }
    ] },
    { title: 'SYSTEM', items: [
      { icon: FiFileText, label: 'Audit Logs', path: linkPath('/audit-logs') },
      { icon: FiFileText, label: 'Error Logs', path: linkPath('/error-logs') }
    ]}
  ];

  const clientGroups = [
    { title: null, items: [ { icon: FiHome, label: 'Overview', display: 'Dashboard', path: linkPath('/dashboard'), color: 'var(--purple)' } ] },
    { title: 'OUTREACH', items: [
      { icon: FiMail, label: 'Outreach', path: linkPath('/outreach') },
      { icon: FiUsers, label: 'Leads', path: linkPath('/leads') },
      { icon: FiZap, label: 'Pipelines', path: linkPath('/pipelines') },
      { icon: FiCalendar, label: 'Meetings', path: linkPath('/meetings') },
    ]},
    { title: 'ACCOUNT', items: [
      { icon: FiSettings, label: 'Settings', path: linkPath('/settings') },
      { icon: FiHelpCircle, label: 'Help', path: linkPath('/help') }
    ]}
  ];

  const groups = admin ? (compact ? compactAdminGroups : adminGroups) : clientGroups;

  return (
    <aside className={`dashboard-sidebar ${admin ? 'admin' : ''}`}>
      <div className="dashboard-client-id" style={{ paddingTop: 22 }}>
        <div className="client-key">Client ID</div>
        <div className="client-value">{client && client.client_id ? client.client_id : clientId || '—'}</div>
      </div>

      <div className="nav-list">
        {groups.map((g, gi) => (
          <div key={gi} className="nav-section">
            {g.title && <div className="nav-section-title">{g.title}</div>}
            {g.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label || active === item.display;
              const display = item.display || item.label;
              return item.path ? (
                <Link key={item.label} to={item.path} className="nav-link">
                  <div className={`nav-item ${isActive ? 'active' : ''}`}>
                    <div className="nav-icon"><Icon size={18} /></div>
                    <div>{display}</div>
                  </div>
                </Link>
              ) : (
                <div key={item.label} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <div className="nav-icon"><Icon size={18} /></div>
                  <div>{display}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>
        <button className="help-btn"><FiHelpCircle size={16} style={{ marginRight: 8 }} /> Help & Support</button>
      </div>

      <div className="sidebar-profile" style={{ padding: '12px 16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="profile-avatar" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>SA</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>Super Admin</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>super@orvanto.com</div>
        </div>
      </div>

      <div className="logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
        <FiLogOut size={18} color="var(--muted)" /> Logout
      </div>
    </aside>
  );
}
