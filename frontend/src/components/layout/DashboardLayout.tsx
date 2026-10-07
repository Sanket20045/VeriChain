import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Plus, 
  XCircle, 
  CheckCircle, 
  History, 
  Users, 
  LogOut, 
  Wallet, 
  Menu,
  X,
  Copy,
  Check
} from 'lucide-react';

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
      { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'Certificates',
    items: [
      { to: '/admin/certificates', label: 'All Certificates', icon: <FileText size={17} /> },
      { to: '/issuer/issue', label: 'Issue Certificate', icon: <Plus size={17} /> },
      { to: '/admin/certificates?status=revoked', label: 'Revoked', icon: <XCircle size={17} /> },
    ],
  },
  {
    title: 'Verification',
    items: [
      { to: '/verify', label: 'Verify Certificate', icon: <CheckCircle size={17} /> },
      { to: '/admin/verifications', label: 'Verification History', icon: <History size={17} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/issuers', label: 'Issuers', icon: <Users size={17} /> },
    ],
  },
];

const issuerNav: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { to: '/issuer', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'Certificates',
    items: [
      { to: '/issuer/issue', label: 'Issue Certificate', icon: <Plus size={17} /> },
      { to: '/issuer/certificates', label: 'My Certificates', icon: <FileText size={17} /> },
      { to: '/issuer/certificates?status=revoked', label: 'Revoked', icon: <XCircle size={17} /> },
    ],
  },
  {
    title: 'Verification',
    items: [
      { to: '/verify', label: 'Verify Certificate', icon: <CheckCircle size={17} /> },
      { to: '/issuer/verifications', label: 'Verification History', icon: <History size={17} /> },
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
  role = 'admin',
  walletAddress = '0x0000...0000',
  collegeName = 'FAMT College',
}: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const nav = role === 'admin' ? adminNav : issuerNav;

  function copyAddress() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function NavGroupComponent({ group }: { group: NavGroup }) {
    return (
      <div className="mb-4">
        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-1.5 select-none">
          {group.title}
        </p>
        <div className="space-y-1">
          {group.items.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? 'font-semibold text-white bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/35 shadow-[0_0_15px_rgba(124,58,237,0.12)]'
                    : 'font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className={`shrink-0 transition-colors ${
                  isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col lg:flex-row relative selection:bg-violet-500/30 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,rgba(124,58,237,0.12),transparent_70%)] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_40%_40%_at_100%_100%,rgba(6,182,212,0.06),transparent_70%)] z-0" />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#090D15]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 lg:z-30 lg:shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
        style={{ width: '256px', minWidth: '256px' }}
      >
        {/* Logo & Brand Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform">
                <Shield size={17} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Veri<span className="text-violet-400">Chain</span>
              </span>
            </Link>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {role === 'admin' ? 'Institutional Admin' : 'Certified Issuer'}
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 custom-scrollbar">
          {nav.map(group => (
            <NavGroupComponent key={group.title} group={group} />
          ))}
        </nav>

        {/* Bottom Panel: Connected Wallet & User Profile */}
        <div className="p-3.5 border-t border-white/[0.08] space-y-3 bg-[#080B12]/80">
          {/* Connected Wallet Pill */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-violet-500/30 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <Wallet size={12} className="text-violet-400" />
                Connected Wallet
              </span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EVM 31337
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-medium">
                {walletAddress}
              </span>
              <button
                onClick={copyAddress}
                title="Copy address"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]">
              {collegeName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {collegeName}
              </p>
              <p className="text-[11px] text-slate-400 capitalize">
                {role} account
              </p>
            </div>
            <Link
              to="/login"
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className="flex-1 min-w-0 flex flex-col relative z-10 w-full"
        style={{ minWidth: 0, flex: 1 }}
      >
        {/* Mobile top navigation bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#090D15]/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white">VeriChain</span>
          </div>
          <div className="w-8" /> {/* spacer */}
        </div>

        {/* Dashboard Child View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-[1500px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
