import React from 'react';

function fmt(n) { if (n === null || n === undefined) return '—'; try { return Number(n).toLocaleString(); } catch { return String(n); } }
function pct(num, den) {
  const base = den && den > 0 ? den : (num && num > 0 ? num : 0);
  if (!base) return '0%';
  return `${((num / base) * 100).toFixed(1)}%`;
}

export default function CampaignTable({ campaigns = [] }) {
  return (
    <div className="table-wrapper campaign-table-wrapper">
      <table className="campaign-table">
        <thead>
          <tr>
            <th style={{width:'40%'}}>Campaign Name</th>
            <th style={{textAlign:'right'}}>Users</th>
            <th style={{textAlign:'right'}}>Leads</th>
            <th style={{textAlign:'right'}}>Replies</th>
            <th style={{textAlign:'right'}}>Meetings</th>
            <th style={{textAlign:'right'}}>Reply Rate</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id}>
              <td>
                <div style={{fontWeight:800}}>{c.name}</div>
                {c.segment && <div className="muted" style={{fontSize:12,marginTop:4}}>{c.segment}</div>}
              </td>
              <td className="td-num">{fmt(c.users)}</td>
              <td className="td-num">{fmt(c.leads)}</td>
              <td className="td-num">{fmt(c.replies)}</td>
              <td className="td-num">{fmt(c.meetings)}</td>
              <td className="td-num">{pct(c.replies, c.leads || c.users)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
