import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Shield, 
  AlertTriangle
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
    <DashboardLayout role="issuer">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--vc-border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--vc-accent-muted)] border border-[rgba(99,102,241,0.25)] text-xs text-[var(--vc-accent)] font-medium mb-2">
              <Shield size={14} /> Authorized Issuing Authority
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--vc-text-primary)] tracking-tight">
              Issuer Workspace
            </h1>
            <p className="text-sm text-[var(--vc-text-secondary)] mt-1">
              Authorized credentials officer: <span className="font-mono text-[var(--vc-accent)] font-semibold">{shortenAddress(issuerWallet, 6)}</span>
            </p>
          </div>

          <Link
            to="/issuer/issue"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--vc-accent)] to-[#4f46e5] text-white font-semibold text-sm shadow-lg shadow-[rgba(99,102,241,0.25)] hover:opacity-95 transition-all w-fit"
          >
            <Plus size={18} />
            Issue New Certificate
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)] mb-1">
              My Total Issued
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {loading ? '...' : certificates.length}
            </div>
            <div className="text-xs text-[var(--vc-text-muted)] mt-1">
              Degrees & provisional awards
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)] mb-1">
              Active Credentials
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-valid)] font-mono">
              {loading ? '...' : activeCount}
            </div>
            <div className="text-xs text-[var(--vc-text-muted)] mt-1">
              Verifiable across the network
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vc-text-secondary)] mb-1">
              Revoked Certificates
            </div>
            <div className="text-3xl font-extrabold text-[var(--vc-invalid)] font-mono">
              {loading ? '...' : revokedCount}
            </div>
            <div className="text-xs text-[var(--vc-text-muted)] mt-1">
              Cryptographically flagged
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--vc-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or VC-ID..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] placeholder-[var(--vc-text-muted)] focus:outline-none focus:border-[var(--vc-accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto bg-[var(--vc-surface)] p-1 rounded-xl border border-[var(--vc-border-subtle)]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-[var(--vc-surface-raised)] text-[var(--vc-text-primary)] shadow-sm'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === 'active'
                  ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] font-semibold'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('revoked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === 'revoked'
                  ? 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] font-semibold'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              Revoked
            </button>
          </div>
        </div>

        {/* Certificate Table */}
        <div className="rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--vc-border-subtle)] bg-[rgba(255,255,255,0.01)] text-[11px] font-semibold text-[var(--vc-text-secondary)] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Degree & Dept</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vc-border-subtle)] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[var(--vc-text-muted)]">
                      Loading registered records...
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[var(--vc-text-muted)]">
                      No certificates match your criteria.
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs font-bold text-[var(--vc-accent)]">
                          {cert.certificate_id}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-[var(--vc-text-primary)]">
                          {cert.student_name}
                        </div>
                        <div className="text-xs text-[var(--vc-text-muted)] font-mono">
                          {cert.student_id}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-[var(--vc-text-primary)]">
                          {cert.certificate_type}
                        </div>
                        <div className="text-[11px] text-[var(--vc-text-muted)]">
                          {cert.department}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[var(--vc-text-secondary)]">
                        {formatDate(cert.issue_date)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          cert.status === 'active'
                            ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                            : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/issuer/certificates/${cert.certificate_id}`}
                            className="p-1.5 rounded-lg bg-[var(--vc-surface)] text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)] border border-[var(--vc-border-subtle)] text-xs inline-flex items-center gap-1"
                          >
                            Details
                          </Link>
                          {cert.status === 'active' && (
                            <button
                              onClick={() => setRevokingCert(cert)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-xs font-medium"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[var(--vc-invalid)]">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-[var(--vc-text-primary)]">
                  Confirm Revocation
                </h3>
              </div>
              <p className="text-xs text-[var(--vc-text-secondary)]">
                You are about to cryptographically revoke certificate{' '}
                <strong className="text-[var(--vc-text-primary)] font-mono">{revokingCert.certificate_id}</strong> for student{' '}
                <strong className="text-[var(--vc-text-primary)]">{revokingCert.student_name}</strong>. This state change is permanent and verifiable on-chain.
              </p>

              {revokeError && (
                <div className="p-3 rounded-xl bg-[var(--vc-invalid-muted)] border border-[var(--vc-invalid)] text-xs text-[var(--vc-invalid)]">
                  {revokeError}
                </div>
              )}

              <form onSubmit={handleRevokeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1">
                    Revocation Audit Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Administrative credit re-evaluation; Degree re-issued under correction."
                    className="w-full p-3 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-invalid)]"
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
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevoke}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--vc-invalid)] text-white hover:opacity-90 shadow-md shadow-[rgba(239,68,68,0.25)] flex items-center gap-1.5"
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
