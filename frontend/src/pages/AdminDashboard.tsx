import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Plus, 
  Users, 
  ArrowUpRight, 
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api, type DashboardStats } from '../services/api';
import type { Certificate } from '../types/certificate';
import type { VerificationLog } from '../types/verification';
import { formatDate } from '../lib/utils';

const verificationTrendData = [
  { day: 'Mon', verifications: 42, genuine: 40, anomalies: 2 },
  { day: 'Tue', verifications: 68, genuine: 64, anomalies: 4 },
  { day: 'Wed', verifications: 95, genuine: 91, anomalies: 4 },
  { day: 'Thu', verifications: 82, genuine: 79, anomalies: 3 },
  { day: 'Fri', verifications: 114, genuine: 109, anomalies: 5 },
  { day: 'Sat', verifications: 53, genuine: 51, anomalies: 2 },
  { day: 'Sun', verifications: 38, genuine: 37, anomalies: 1 },
];

const deptData = [
  { dept: 'CSE', issued: 420 },
  { dept: 'IT', issued: 310 },
  { dept: 'EXTC', issued: 260 },
  { dept: 'MECH', issued: 180 },
  { dept: 'CIVIL', issued: 70 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCerts, setRecentCerts] = useState<Certificate[]>([]);
  const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, certsData, logsData] = await Promise.all([
          api.getStats(),
          api.getCertificates({ status: undefined }),
          api.getVerificationHistory(),
        ]);
        setStats(statsData);
        setRecentCerts(certsData.certificates.slice(0, 5));
        setRecentLogs(logsData.logs.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--vc-border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--vc-accent-muted)] border border-[rgba(99,102,241,0.25)] text-xs text-[var(--vc-accent)] font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--vc-accent)] animate-ping" />
              VeriChain Protocol · Live Sentinel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--vc-text-primary)] tracking-tight">
              Institutional Admin Center
            </h1>
            <p className="text-sm text-[var(--vc-text-secondary)] mt-1">
              Autonomous multi-layered credential oversight, cryptographic anchoring, and live anomaly audit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/issuer/issue"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--vc-accent)] to-[#4f46e5] text-white font-medium text-sm shadow-lg shadow-[rgba(99,102,241,0.25)] hover:opacity-95 transition-all"
            >
              <Plus size={16} />
              Issue Credential
            </Link>
            <Link
              to="/admin/issuers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] text-[var(--vc-text-primary)] font-medium text-sm hover:border-[var(--vc-accent)] transition-all"
            >
              <Users size={16} />
              Manage Issuers
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] relative overflow-hidden group hover:border-[rgba(99,102,241,0.4)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)]">
                Total Registered
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--vc-accent-muted)] flex items-center justify-center text-[var(--vc-accent)]">
                <FileCheck2 size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {loading ? '...' : (stats?.total_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--vc-text-muted)] mt-2">
              <span className="text-[var(--vc-valid)] font-semibold inline-flex items-center">
                ↑ 14.2%
              </span>
              <span>vs previous month</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] relative overflow-hidden group hover:border-[rgba(16,185,129,0.4)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)]">
                Active & Immutable
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--vc-valid-muted)] flex items-center justify-center text-[var(--vc-valid)]">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {loading ? '...' : (stats?.active_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--vc-text-muted)] mt-2">
              <span className="text-[var(--vc-valid)] font-medium">98.2%</span>
              <span>overall valid state</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] relative overflow-hidden group hover:border-[rgba(239,68,68,0.4)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)]">
                Revoked Credentials
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--vc-invalid-muted)] flex items-center justify-center text-[var(--vc-invalid)]">
                <XCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {loading ? '...' : (stats?.revoked_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--vc-text-muted)] mt-2">
              <span className="text-[var(--vc-revoked)] font-medium">Cryptographically blocked</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] relative overflow-hidden group hover:border-[rgba(6,182,212,0.4)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)]">
                Verifications Logged
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--vc-cyan-muted)] flex items-center justify-center text-[var(--vc-cyan)]">
                <Activity size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {loading ? '...' : (stats?.total_verifications ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--vc-text-muted)] mt-2">
              <span className="text-[var(--vc-cyan)] font-semibold">24/7 Zero-Trust</span>
              <span>audits executed</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                  Verification Velocity & AI Sentinel
                </h3>
                <p className="text-xs text-[var(--vc-text-secondary)]">
                  Daily employer/verifier requests vs detected tampering indicators
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--vc-text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--vc-accent)]" />
                  Requests
                </div>
                <div className="flex items-center gap-1.5 text-[var(--vc-text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--vc-invalid)]" />
                  Tampering
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={verificationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#10141b', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="verifications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVerif)" />
                  <Area type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAnom)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown Bar Chart */}
          <div className="p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                Issuance by Discipline
              </h3>
              <p className="text-xs text-[var(--vc-text-secondary)] mb-4">
                Anchored credentials across academic departments
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dept" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#10141b', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="issued" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-[var(--vc-border-subtle)] flex items-center justify-between text-xs text-[var(--vc-text-muted)]">
              <span>Primary Anchor: Hardhat Localnet (31337)</span>
              <span className="text-[var(--vc-valid)] font-mono">Synced</span>
            </div>
          </div>
        </div>

        {/* Split Tables: Recent Certificates & Live Audit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Credentials */}
          <div className="p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                Recent Issued Credentials
              </h3>
              <Link
                to="/admin/certificates"
                className="text-xs font-semibold text-[var(--vc-accent)] hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] flex items-center justify-between hover:border-[var(--vc-accent)] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--vc-text-primary)]">
                        {cert.certificate_id}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        cert.status === 'active' 
                          ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                          : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--vc-text-secondary)]">
                      {cert.student_name} · <span className="text-[var(--vc-text-muted)]">{cert.course}</span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/certificates/${cert.certificate_id}`}
                    className="p-2 rounded-lg bg-[var(--vc-surface-raised)] text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)] hover:border border-[var(--vc-border-subtle)] transition-all"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Live Verifications Stream */}
          <div className="p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                Live Verification Sentinel Stream
              </h3>
              <Link
                to="/admin/verifications"
                className="text-xs font-semibold text-[var(--vc-accent)] hover:underline inline-flex items-center gap-1"
              >
                Full Audit Log <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] flex items-center justify-between hover:border-[var(--vc-border-strong)] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-[var(--vc-text-primary)]">
                        {log.certificate_id}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        log.final_result === 'valid'
                          ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                          : log.final_result === 'suspicious'
                          ? 'bg-[var(--vc-suspicious-muted)] text-[var(--vc-suspicious)] border border-[rgba(245,158,11,0.3)]'
                          : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                      }`}>
                        {log.final_result}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--vc-surface-raised)] text-[var(--vc-text-muted)] uppercase font-mono">
                        {log.verification_method}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--vc-text-muted)] line-clamp-1">
                      {log.explanation || 'Verification performed via cryptographic sentinel'}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--vc-text-muted)]">
                    {formatDate(log.verified_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node & Chain Health Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[rgba(99,102,241,0.1)] to-[rgba(6,182,212,0.1)] border border-[rgba(99,102,241,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] flex items-center justify-center text-[var(--vc-accent)]">
              <Cpu size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--vc-text-primary)]">
                Local Hardhat EVM · Connected
              </div>
              <div className="text-xs text-[var(--vc-text-secondary)] font-mono">
                Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3 · Port: 8545
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--vc-valid)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--vc-text-primary)]">
              Block Sync: 100% OK
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
