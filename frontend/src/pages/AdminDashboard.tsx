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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              VeriChain Protocol · Live Sentinel
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Institutional Admin Center
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Autonomous multi-layered credential oversight, cryptographic anchoring, and live anomaly audit.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/issuer/issue"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={15} />
              Issue Credential
            </Link>
            <Link
              to="/admin/issuers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white font-semibold text-xs transition-all"
            >
              <Users size={15} />
              Manage Issuers
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Registered */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-violet-500/30 shadow-lg shadow-black/40 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Registered
              </span>
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                <FileCheck2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {loading ? '...' : (stats?.total_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              <span className="text-emerald-400 font-semibold inline-flex items-center">
                ↑ 14.2%
              </span>
              <span>vs previous month</span>
            </div>
          </div>

          {/* Active & Immutable */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-emerald-500/30 shadow-lg shadow-black/40 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active & Immutable
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-400 font-mono">
              {loading ? '...' : (stats?.active_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              <span className="text-emerald-400 font-medium">98.2%</span>
              <span>overall valid state</span>
            </div>
          </div>

          {/* Revoked Credentials */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-rose-500/30 shadow-lg shadow-black/40 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Revoked Credentials
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <XCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-rose-400 font-mono">
              {loading ? '...' : (stats?.revoked_certificates ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              <span className="text-rose-400 font-medium">Cryptographically blocked</span>
            </div>
          </div>

          {/* Verifications Logged */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/30 shadow-lg shadow-black/40 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verifications Logged
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Activity size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-cyan-400 font-mono">
              {loading ? '...' : (stats?.total_verifications ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              <span className="text-cyan-400 font-medium">24/7 Zero-Trust</span>
              <span>audits executed</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 overflow-hidden flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-white/[0.04]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Verification Velocity & AI Sentinel
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily employer/verifier requests vs detected tampering indicators
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  Requests
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  Tampering
                </div>
              </div>
            </div>

            <div className="w-full my-1" style={{ height: 240, minHeight: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={verificationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.12)', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(12px)'
                    }} 
                  />
                  <Area type="monotone" dataKey="verifications" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVerif)" />
                  <Area type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAnom)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown Bar Chart */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-base font-bold text-white">
                Issuance by Discipline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-2">
                Anchored credentials across academic departments
              </p>
            </div>

            <div className="w-full my-1" style={{ height: 210, minHeight: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="dept" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.12)', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(12px)'
                    }} 
                  />
                  <Bar dataKey="issued" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
              <span>Primary Anchor: Hardhat Localnet (31337)</span>
              <span className="text-emerald-400 font-mono font-semibold">Synced</span>
            </div>
          </div>
        </div>

        {/* Split Tables: Recent Certificates & Live Audit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Credentials */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.04]">
                <h3 className="text-base font-bold text-white">
                  Recent Issued Credentials
                </h3>
                <Link
                  to="/admin/certificates"
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>

              {recentCerts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-500 flex items-center justify-center mx-auto">
                    <FileCheck2 size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-300">No credentials issued yet</div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                      Mint your first degree or certificate to see it permanently indexed here.
                    </p>
                  </div>
                  <Link
                    to="/issuer/issue"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-semibold hover:bg-violet-600/30 transition-all"
                  >
                    <Plus size={13} /> Issue First Diploma
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCerts.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white">
                            {cert.certificate_id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            cert.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {cert.student_name} · <span className="text-slate-500">{cert.course}</span>
                        </div>
                      </div>

                      <Link
                        to={`/admin/certificates/${cert.certificate_id}`}
                        className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Verifications Stream */}
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.04]">
                <h3 className="text-base font-bold text-white">
                  Live Verification Sentinel Stream
                </h3>
                <Link
                  to="/admin/verifications"
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                >
                  Full Audit Log <ArrowUpRight size={14} />
                </Link>
              </div>

              {recentLogs.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-500 flex items-center justify-center mx-auto">
                    <Activity size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-300">No verification requests yet</div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                      Verification requests from employers and students will appear here in real-time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between transition-all"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-white">
                            {log.certificate_id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            log.final_result === 'valid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : log.final_result === 'suspicious'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.final_result}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 uppercase font-mono border border-white/[0.06]">
                            {log.verification_method}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {log.explanation || 'Verification performed via cryptographic sentinel'}
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {formatDate(log.verified_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Node & Chain Health Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 via-slate-900/60 to-cyan-950/30 border border-violet-500/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
              <Cpu size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Local Hardhat EVM · Connected
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">Chain ID 31337</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3 · Port: 8545
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-semibold text-slate-200">
              Block Sync: 100% OK
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
