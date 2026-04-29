import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Admin from "./pages/Admin";
import Tenants from "./pages/Tenants";
import ViewTenant from "./pages/ViewTenant";
import ManageSubscription from "./pages/ManageSubscription";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import AuditLogs from "./pages/AuditLogs";
import ErrorLogs from "./pages/ErrorLogs";
import Subscriptions from "./pages/Subscriptions";
import Meetings from "./pages/Meetings";
import Outreach from "./pages/Outreach";
import Portal from "./pages/Portal";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reports from "./pages/Reports";
import BlogPost from "./pages/BlogPost";
import ApiDocs from "./pages/ApiDocs";
import DataDeletion from "./pages/DataDeletion";
import Policy from "./pages/Policy";
import Refund from "./pages/Refund";
import TermsOfService from "./pages/TermsOfService";
import Unsubscribe from "./pages/Unsubscribe";
import VideoPlayer from "./pages/VideoPlayer";
import Blog from "./pages/Blog";
import Navbar from './components/Navbar';
import Pipeline from './pages/Pipeline';
import Warmup from './pages/Warmup';

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();
  // Hide the global site navbar on the portal and internal dashboard routes
  const hidePaths = ['/portal', '/dashboard', '/leads', '/meetings', '/outreach', '/pipeline', '/reports', '/warmup', '/admin'];
  const hideGlobalNavbar = hidePaths.some(p => location.pathname.startsWith(p));

  return (
    <>
      <InitialRedirect />
      <PageTransitionManager />
      {!hideGlobalNavbar && <Navbar />}
      <div id="page-transition" className="page-transition">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/tenants/:id" element={<ViewTenant />} />
        <Route path="/tenants/:id/subscription" element={<ManageSubscription />} />
        <Route path="/platform-analytics" element={<PlatformAnalytics />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/error-logs" element={<ErrorLogs />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/warmup" element={<Warmup />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/tutorial" element={<VideoPlayer />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

function InitialRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    try {
      if (location.pathname === '/' && !sessionStorage.getItem('orvanto:welcomeShown')) {
        sessionStorage.setItem('orvanto:welcomeShown', '1');
        navigate('/welcome', { replace: true });
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [location.pathname, navigate]);
  return null;
}

function PageTransitionManager() {
  const location = useLocation();
  useEffect(() => {
    const el = document.getElementById('page-transition') || document.getElementById('root');
    if (!el) return;
    // remove any lingering exit state and perform a subtle enter animation
    el.classList.remove('page-exit');
    el.classList.add('page-enter');
    const enterDur = parseInt(getComputedStyle(el).getPropertyValue('--page-enter-duration')) || 420;
    const t = setTimeout(() => el.classList.remove('page-enter'), enterDur + 40);
    return () => clearTimeout(t);
  }, [location.pathname]);
  return null;
}
