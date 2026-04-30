import React, { useState, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

function initials(name) {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
}

function formatDate(iso) {
  try { const d = new Date(iso); return d.toLocaleDateString(); } catch { return iso; }
}

function timeAgo(iso) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
    return Math.floor(diff/86400000) + 'd ago';
  } catch { return iso; }
}

export default function UsersTable({ users = [] }) {
  const [openFor, setOpenFor] = useState(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!e || !e.target) return;
      if (!e.target.closest || !document) return;
      if (!e.target.closest('.actions-wrap')) setOpenFor(null);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleAction = (action, user) => {
    setOpenFor(null);
    // placeholder handlers — integrate with actual logic
    if (action === 'view') {
      // navigate to profile (placeholder)
      window.location.href = `/profile/${user.id}`;
      return;
    }
    alert(`${action.replace('-', ' ')} — ${user.name}`);
  };

  return (
    <div className="table-wrapper users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Team</th>
            <th>Join Date</th>
            <th>Last Active</th>
            <th style={{textAlign:'right'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="user-row">
              <td className="user-cell">
                <div className="user-info">
                  <div className="avatar" style={{ background: u.avatarColor || 'var(--border)' }}>{initials(u.name)}</div>
                  <div className="user-meta">
                    <div className="user-name">{u.name}</div>
                    <div className="muted" style={{fontSize:12}}>{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="td-muted">{u.email}</td>
              <td className="td-muted">{u.plan}</td>
              <td><span className={`status-pill ${u.status==='Active' ? 'active' : 'inactive'}`}>{u.status}</span></td>
              <td className="td-muted">{u.team}</td>
              <td className="td-muted">{formatDate(u.joinDate)}</td>
              <td className="td-muted">{timeAgo(u.lastActive)}</td>
              <td style={{textAlign:'right'}}>
                <div className="actions-wrap">
                  <button className="more-btn" onClick={(e) => { e.stopPropagation(); setOpenFor(openFor === u.id ? null : u.id); }} aria-label="Actions"><FiMoreVertical /></button>
                  {openFor === u.id && (
                    <div className="actions-menu" role="menu">
                      <button onClick={() => handleAction('view', u)}>View Profile</button>
                      <button onClick={() => handleAction('upgrade', u)}>Upgrade Plan</button>
                      <button onClick={() => handleAction('suspend', u)}>Suspend User</button>
                      <button onClick={() => handleAction('delete', u)}>Delete User</button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
