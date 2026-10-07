import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Certificate } from '../types/certificate';
import { formatDate, shortenHash } from '../lib/utils';

export default function Certificates() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  // Revoke state
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const issuerWallet = '0x71C84192e3a936a94158428d09559C381F4faC43';

  async function loadData() {
    try {
      setLoading(true);
      const data = await api.getCertificates({
        status: statusFilter === 'all' ? undefined : statusFilter,
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
    // Read query params if any
    const params = new URLSearchParams(location.search);
    const qStatus = params.get('status');
    if (qStatus === 'revoked' || qStatus === 'active') {
      setStatusFilter(qStatus);
    }
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  async function handleRevoke(e: React.FormEvent) {
    e.preventDefault();
    if (!revokingCert) return;
    if (!revokeReason.trim()) {
      setRevokeError('Please provide a reason for revocation.');
      return;
    }

    try {
      setIsRevoking(true);
      setRevokeError(null);
      await api.revokeCertificate(revokingCert.certificate_id, revokeReason, issuerWallet);
      setRevokingCert(null);
      setRevokeReason('');
      await loadData();
    } catch (err: any) {
      setRevokeError(err.message || 'Failed to revoke certificate');
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <DashboardLayout role={isAdmin ? 'admin' : 'issuer'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--vc-border-subtle)] pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--vc-text-primary)]">
              Certificate Repository
            </h1>
            <p className="text-xs text-[var(--vc-text-secondary)] mt-1">
              Cryptographically registered academic degrees, diplomas, and official transcripts.
            </p>
          </div>

          <Link
            to="/issuer/issue"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--vc-accent)] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-[rgba(99,102,241,0.2)] transition-all w-fit"
          >
            <Plus size={15} />
            Issue Credential
          </Link>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--vc-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, PRN, or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] placeholder-[var(--vc-text-muted)] focus:outline-none focus:border-[var(--vc-accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto bg-[var(--vc-surface)] p-1 rounded-xl border border-[var(--vc-border-subtle)]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-[var(--vc-surface-raised)] text-[var(--vc-text-primary)] shadow-sm'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] font-semibold'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('revoked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'revoked'
                  ? 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] font-semibold'
                  : 'text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              Revoked
            </button>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--vc-border-subtle)] bg-[rgba(255,255,255,0.01)] text-[11px] font-semibold text-[var(--vc-text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Document Hash</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vc-border-subtle)] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--vc-text-muted)]">
                      Fetching credential records...
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--vc-text-muted)]">
                      No matching certificates found.
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={isAdmin ? `/admin/certificates/${cert.certificate_id}` : `/issuer/certificates/${cert.certificate_id}`}
                          className="font-mono font-bold text-[var(--vc-accent)] hover:underline"
                        >
                          {cert.certificate_id}
                        </Link>
                        <div className="text-[10px] text-[var(--vc-text-muted)] mt-0.5">
                          Issued: {formatDate(cert.issue_date)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--vc-text-primary)]">
                          {cert.student_name}
                        </div>
                        <div className="text-[10px] text-[var(--vc-text-muted)] font-mono">
                          {cert.student_id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[var(--vc-text-primary)] font-medium">
                          {cert.course}
                        </div>
                        <div className="text-[10px] text-[var(--vc-text-muted)]">
                          {cert.department}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-[var(--vc-text-secondary)] bg-[var(--vc-surface)] px-2 py-0.5 rounded border border-[var(--vc-border-subtle)]">
                          {shortenHash(cert.document_hash, 6)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          cert.status === 'active'
                            ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                            : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                        }`}>
                          {cert.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={isAdmin ? `/admin/certificates/${cert.certificate_id}` : `/issuer/certificates/${cert.certificate_id}`}
                            className="p-1.5 rounded-lg bg-[var(--vc-surface)] text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)] border border-[var(--vc-border-subtle)] text-[11px] font-medium inline-flex items-center gap-1"
                          >
                            Details
                          </Link>
                          {cert.status === 'active' && (
                            <button
                              onClick={() => setRevokingCert(cert)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-[11px] font-medium"
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

        {/* Revoke Modal */}
        {revokingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[var(--vc-invalid)]">
                <AlertTriangle size={24} />
                <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                  Revoke Certificate Confirmation
                </h3>
              </div>
              <p className="text-xs text-[var(--vc-text-secondary)]">
                Certificate <strong className="text-[var(--vc-text-primary)] font-mono">{revokingCert.certificate_id}</strong> will be marked as revoked. Subsequent verifications will flag this credential as invalid.
              </p>

              {revokeError && (
                <div className="p-3 rounded-xl bg-[var(--vc-invalid-muted)] border border-[var(--vc-invalid)] text-xs text-[var(--vc-invalid)]">
                  {revokeError}
                </div>
              )}

              <form onSubmit={handleRevoke} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1">
                    Revocation Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Provide official administrative justification..."
                    className="w-full p-3 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-invalid)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isRevoking}
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
                    disabled={isRevoking}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--vc-invalid)] text-white hover:opacity-90 shadow-md shadow-[rgba(239,68,68,0.25)]"
                  >
                    {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
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
