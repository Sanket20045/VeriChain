import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Shield, 
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Certificate } from '../types/certificate';
import { formatDate, shortenAddress } from '../lib/utils';

export default function IssuerDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const issuerWallet = '0x71C84192e3a936a94158428d09559C381F4faC43';

  async function loadCertificates() {
    try {
      setLoading(true);
      const data = await api.getCertificates({
        status: filter === 'all' ? undefined : filter,
        search: search.trim() || undefined,
      });
      setCertificates(data.certificates);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificates();
  }, [filter, search]);

  const activeCount = certificates.filter(c => c.status === 'active').length;
  const revokedCount = certificates.filter(c => c.status === 'revoked').length;

  async function handleRevokeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!revokingCert) return;
    if (!revokeReason.trim()) {
      setRevokeError('Please provide a legitimate reason for revocation.');
      return;
    }

    try {
      setIsSubmittingRevoke(true);
      setRevokeError(null);
      await api.revokeCertificate(revokingCert.certificate_id, revokeReason, issuerWallet);
      setRevokingCert(null);
      setRevokeReason('');
      await loadCertificates();
    } catch (err: any) {
      setRevokeError(err.message || 'Failed to revoke certificate');
    } finally {
      setIsSubmittingRevoke(false);
    }
  }

  return (
    <DashboardLayout role="issuer" walletAddress={issuerWallet}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
              <Shield size={13} />
              Authorized Issuing Authority
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Issuer Workspace
            </h1>
            <p className="text-sm text-slate-400">
              Official credentials officer: <span className="font-mono text-violet-400 font-semibold">{shortenAddress(issuerWallet, 6)}</span>
            </p>
          </div>

          <Link
            to="/issuer/issue"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all w-fit"
          >
            <Plus size={16} />
            Issue New Certificate
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-violet-500/30 shadow-lg shadow-black/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                My Total Issued
              </span>
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                <FileCheck2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {loading ? '...' : certificates.length}
            </div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              Degrees & provisional awards
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-emerald-500/30 shadow-lg shadow-black/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Credentials
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-400 font-mono">
              {loading ? '...' : activeCount}
            </div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              Verifiable across the network
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] hover:border-rose-500/30 shadow-lg shadow-black/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Revoked Certificates
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <XCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-rose-400 font-mono">
              {loading ? '...' : revokedCount}
            </div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              Cryptographically flagged
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or VC-ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-violet-600/20 text-white border border-violet-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('revoked')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'revoked'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revoked
            </button>
          </div>
        </div>

        {/* Certificate Table */}
        <div className="rounded-2xl bg-[#0e131f]/90 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Certificate ID</th>
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Degree & Dept</th>
                  <th className="py-3.5 px-5">Issue Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                      Loading registered records...
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                      No certificates match your criteria.
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-5">
                        <div className="font-mono text-xs font-bold text-violet-400 group-hover:text-violet-300 transition-colors">
                          {cert.certificate_id}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-white">
                          {cert.student_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {cert.student_id}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-xs text-slate-300 font-medium">
                          {cert.certificate_type}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cert.department}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {formatDate(cert.issue_date)}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          cert.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/issuer/certificates/${cert.certificate_id}`}
                            className="p-1.5 rounded-lg bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] text-xs inline-flex items-center gap-1 transition-all"
                          >
                            Details <ArrowUpRight size={13} />
                          </Link>
                          {cert.status === 'active' && (
                            <button
                              onClick={() => setRevokingCert(cert)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium transition-all"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revocation Confirmation Modal */}
        {revokingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f1422] border border-rose-500/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-white">
                  Confirm Revocation
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are about to cryptographically revoke certificate{' '}
                <strong className="text-white font-mono">{revokingCert.certificate_id}</strong> for student{' '}
                <strong className="text-white">{revokingCert.student_name}</strong>. This state change is permanent and verifiable on-chain.
              </p>

              {revokeError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {revokeError}
                </div>
              )}

              <form onSubmit={handleRevokeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Revocation Audit Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Administrative credit re-evaluation; Degree re-issued under correction."
                    className="w-full p-3 text-xs rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-rose-500/50 placeholder-slate-600 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmittingRevoke}
                    onClick={() => {
                      setRevokingCert(null);
                      setRevokeReason('');
                      setRevokeError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevoke}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
                  >
                    {isSubmittingRevoke ? 'Revoking...' : 'Revoke Certificate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
