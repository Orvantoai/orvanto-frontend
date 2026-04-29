import { Link } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import '../pages/Dashboard.css';

export default function DashboardHeader({ title, subtitle, onExport, onRefresh, showExport = true, showRefresh = false, loading = false }) {
  const handleExport = (e) => { if (typeof onExport === 'function') onExport(e); };
  const handleRefresh = (e) => { if (typeof onRefresh === 'function') onRefresh(e); };

  return (
    <>
      <div className="top-header">
        <div className="top-header-left">
          <Link to="/" className="logo-link">
            <img src="/orvanto.png" alt="Orvanto logo" className="logo-img" />
            <span className="logo-text-main">Orvanto AI</span>
          </Link>
        </div>
        <div className="header-links header-actions">
          {showRefresh && <button onClick={handleRefresh} disabled={loading} className="header-btn">{loading ? 'Refreshing...' : 'Refresh'}</button>}
          {showExport && <button onClick={handleExport} className="portal-link" type="button"><FiDownload style={{ marginRight: 8 }} />Export Report</button>}
        </div>
      </div>
      <div className="header-gap" />
    </>
  );
}
