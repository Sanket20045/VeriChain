import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { VerificationLog } from '../types/verification';
import { formatDateTime } from '../lib/utils';

export default function VerificationHistory() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'valid' | 'suspicious' | 'revoked' | 'invalid'>('all');

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await api.getVerificationHistory({
        status: filter === 'all' ? undefined : filter,
      });
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load verification logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [filter]);

  return (
    <DashboardLayout role={isAdmin ? 'admin' : 'issuer'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--vc-border-subtle)] pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--vc-text-primary)]">
              Verification Audit Stream
            </h1>
            <p className="text-xs text-[var(--vc-text-secondary)] mt-1">
              Immutable forensic log of all third-party verifications, hash checks, and AI tamper detections.
            </p>
          </div>

          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] text-xs font-semibold text-[var(--vc-text-primary)] hover:border-[var(--vc-accent)] transition-all w-fit"
          >
            Verify a Certificate <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Queries' },
            { id: 'valid', label: 'Valid / Authentic' },
            { id: 'suspicious', label: 'AI Flagged Suspicious' },
            { id: 'revoked', label: 'Revoked' },
            { id: 'invalid', label: 'Tampered / Invalid' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filter === item.id
                  ? 'bg-[var(--vc-surface-raised)] border border-[var(--vc-accent)] text-[var(--vc-text-primary)] font-semibold shadow-sm'
                  : 'bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Log table */}
        <div className="rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--vc-border-subtle)] bg-[rgba(255,255,255,0.01)] text-[11px] font-semibold text-[var(--vc-text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Certificate Query</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Result State</th>
                  <th className="py-3 px-4">AI Tamper Risk</th>
                  <th className="py-3 px-4">Audited At</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vc-border-subtle)] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--vc-text-muted)]">
                      Scanning verification audit ledger...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--vc-text-muted)]">
                      No verification events recorded for this criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[var(--vc-text-primary)]">
                          {log.certificate_id}
                        </div>
                        <div className="text-[10px] text-[var(--vc-text-muted)] line-clamp-1 mt-0.5">
                          {log.explanation}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] uppercase text-[var(--vc-text-secondary)]">
                          {log.verification_method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          log.final_result === 'valid'
                            ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                            : log.final_result === 'suspicious'
                            ? 'bg-[var(--vc-suspicious-muted)] text-[var(--vc-suspicious)] border border-[rgba(245,158,11,0.3)]'
                            : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                        }`}>
                          {log.final_result}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {log.ai_score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-[var(--vc-surface)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${log.ai_score}%`,
                                  backgroundColor:
                                    log.ai_score > 70
                                      ? 'var(--vc-invalid)'
                                      : log.ai_score > 40
                                      ? 'var(--vc-suspicious)'
                                      : 'var(--vc-valid)',
                                }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-[var(--vc-text-muted)]">
                              {log.ai_score}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--vc-text-muted)] text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--vc-text-secondary)] text-[11px]">
                        {formatDateTime(log.verified_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/verify/${log.certificate_id}`}
                          className="p-1.5 rounded-lg bg-[var(--vc-surface)] text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)] border border-[var(--vc-border-subtle)] text-xs inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
