import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Plus, XCircle, CheckCircle, History, Users, LogOut, Wallet, Menu } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const adminNav: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'Certificates',
    items: [
      { to: '/admin/certificates', label: 'All Certificates', icon: <FileText size={16} /> },
      { to: '/issuer/issue', label: 'Issue Certificate', icon: <Plus size={16} /> },
      { to: '/admin/certificates?status=revoked', label: 'Revoked', icon: <XCircle size={16} /> },
    ],
  },
  {
    title: 'Verification',
    items: [
      { to: '/verify', label: 'Verify Certificate', icon: <CheckCircle size={16} /> },
      { to: '/admin/verifications', label: 'Verification History', icon: <History size={16} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/issuers', label: 'Issuers', icon: <Users size={16} /> },
    ],
  },
];

const issuerNav: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { to: '/issuer', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'Certificates',
    items: [
      { to: '/issuer/issue', label: 'Issue Certificate', icon: <Plus size={16} /> },
      { to: '/issuer/certificates', label: 'My Certificates', icon: <FileText size={16} /> },
      { to: '/issuer/certificates?status=revoked', label: 'Revoked', icon: <XCircle size={16} /> },
    ],
  },
  {
    title: 'Verification',
    items: [
      { to: '/verify', label: 'Verify Certificate', icon: <CheckCircle size={16} /> },
      { to: '/issuer/verifications', label: 'Verification History', icon: <History size={16} /> },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'admin' | 'issuer';
  walletAddress?: string;
  collegeName?: string;
}

export default function DashboardLayout({
  children,
  role = 'issuer',
  walletAddress = '0x0000...0000',
  collegeName = 'FAMT College',
}: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = role === 'admin' ? adminNav : issuerNav;

  function NavGroup({ group }: { group: { title: string; items: NavItem[] } }) {
    return (
      <div style={{ marginBottom: 8 }}>
        <p className="vc-sidebar-section-label">{group.title}</p>
        {group.items.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`vc-sidebar-nav-item ${location.pathname === item.to ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--vc-bg-base)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`vc-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--vc-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              Veri<span style={{ color: 'var(--vc-accent-light)' }}>Chain</span>
            </span>
          </Link>
          <div style={{ marginTop: 8 }}>
            <span className="vc-badge vc-badge-accent" style={{ fontSize: '0.65rem' }}>
              {role === 'admin' ? 'College Admin' : 'Certificate Issuer'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
          {nav.map(group => <NavGroup key={group.title} group={group} />)}
        </nav>

        {/* Bottom: wallet + profile */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--vc-border)' }}>
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--vc-surface-2)', border: '1px solid var(--vc-border)',
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Wallet size={13} style={{ color: 'var(--vc-accent-light)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--vc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Connected Wallet
              </span>
            </div>
            <p className="vc-font-mono" style={{ fontSize: '0.75rem' }}>{walletAddress}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--vc-accent-dim)', border: '1px solid var(--vc-border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--vc-accent-light)',
            }}>
              {collegeName[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {collegeName}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--vc-text-muted)' }}>{role}</p>
            </div>
            <Link to="/login" className="vc-btn vc-btn-ghost vc-btn-sm" style={{ padding: '4px' }}>
              <LogOut size={13} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="vc-main-with-sidebar" style={{ flex: 1 }}>
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 mb-5 pb-4 border-b border-[var(--vc-border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="vc-btn vc-btn-ghost vc-btn-sm"
          >
            <Menu size={18} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
