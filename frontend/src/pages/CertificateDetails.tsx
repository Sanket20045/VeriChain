import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { Certificate } from '../types/certificate';
import { formatDate, formatDateTime } from '../lib/utils';

export default function CertificateDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function loadCert() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getCertificate(id);
        setCert(data);
      } catch (err: any) {
        setError(err.message || 'Certificate not found.');
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [id]);

  function copyText(text: string, fieldName: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }

  if (loading) {
    return (
      <DashboardLayout role={isAdmin ? 'admin' : 'issuer'}>
        <div className="py-20 text-center text-xs text-[var(--vc-text-muted)]">
          Loading certificate cryptographic record...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !cert) {
    return (
      <DashboardLayout role={isAdmin ? 'admin' : 'issuer'}>
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] flex items-center justify-center mx-auto">
            <XCircle size={24} />
          </div>
          <h2 className="text-base font-bold text-[var(--vc-text-primary)]">Record Not Found</h2>
          <p className="text-xs text-[var(--vc-text-secondary)]">{error || 'Certificate could not be loaded.'}</p>
          <Link
            to={isAdmin ? '/admin/certificates' : '/issuer/certificates'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-xs font-semibold text-[var(--vc-text-primary)]"
          >
            <ArrowLeft size={14} /> Back to Repository
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isRevoked = cert.status === 'revoked';

  return (
    <DashboardLayout role={isAdmin ? 'admin' : 'issuer'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to={isAdmin ? '/admin/certificates' : '/issuer/certificates'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Repository
          </Link>

          <Link
            to={`/verify/${cert.certificate_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--vc-accent)] text-white text-xs font-semibold hover:opacity-90 shadow-sm"
          >
            <ExternalLink size={13} /> Launch Public Verification
          </Link>
        </div>

        {/* Top Summary Banner */}
        <div className="p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                isRevoked
                  ? 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                  : 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
              }`}>
                {isRevoked ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                {cert.status}
              </span>
              <span className="text-xs text-[var(--vc-text-muted)] font-mono">
                {cert.certificate_type}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--vc-text-primary)] font-mono">
              {cert.certificate_id}
            </h1>
            <p className="text-sm text-[var(--vc-text-secondary)] mt-0.5">
              Conferred to <strong className="text-[var(--vc-text-primary)]">{cert.student_name}</strong> ({cert.student_id})
            </p>
          </div>

          <button
            onClick={() => copyText(cert.certificate_id, 'id')}
            className="px-3.5 py-2 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-xs font-semibold text-[var(--vc-text-primary)] hover:border-[var(--vc-accent)] inline-flex items-center gap-2 self-start md:self-auto"
          >
            <Copy size={13} />
            {copiedField === 'id' ? 'Copied ID' : 'Copy ID'}
          </button>
        </div>

        {/* Revocation Warning if Revoked */}
        {isRevoked && (
          <div className="p-5 rounded-2xl bg-[var(--vc-invalid-muted)] border border-[rgba(239,68,68,0.3)] flex items-start gap-3">
            <AlertTriangle size={20} className="text-[var(--vc-invalid)] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[var(--vc-invalid)] text-sm">
                This credential was revoked by the authorized institution
              </div>
              <p className="text-[var(--vc-text-secondary)]">
                Reason: <span className="text-[var(--vc-text-primary)] font-medium">{cert.revocation_reason || 'Administrative action'}</span>
              </p>
              {cert.revoked_at && (
                <p className="text-[var(--vc-text-muted)]">
                  Revoked at: {formatDateTime(cert.revoked_at)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Content Split: Details & Cryptography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] space-y-4">
            <h3 className="text-xs font-semibold text-[var(--vc-text-muted)] uppercase tracking-wider">
              Academic Record Particulars
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                <span className="text-[var(--vc-text-muted)] block text-[11px]">Degree / Program</span>
                <span className="font-semibold text-[var(--vc-text-primary)] mt-0.5 block">{cert.course}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                <span className="text-[var(--vc-text-muted)] block text-[11px]">Department</span>
                <span className="font-semibold text-[var(--vc-text-primary)] mt-0.5 block">{cert.department}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                <span className="text-[var(--vc-text-muted)] block text-[11px]">Granting Institution</span>
                <span className="font-semibold text-[var(--vc-text-primary)] mt-0.5 block">{cert.college_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                <span className="text-[var(--vc-text-muted)] block text-[11px]">Issue Date</span>
                <span className="font-semibold text-[var(--vc-text-primary)] mt-0.5 block">{formatDate(cert.issue_date)}</span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-[var(--vc-text-muted)] uppercase tracking-wider mb-2">
                Cryptographic Audit Proofs
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                  <div className="flex items-center justify-between text-[11px] text-[var(--vc-text-muted)] mb-1">
                    <span>Document SHA-256 Digest</span>
                    <button
                      onClick={() => copyText(cert.document_hash, 'hash')}
                      className="text-[var(--vc-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <Copy size={11} /> {copiedField === 'hash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--vc-text-primary)] break-all">
                    {cert.document_hash}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                  <div className="flex items-center justify-between text-[11px] text-[var(--vc-text-muted)] mb-1">
                    <span>Anchoring Transaction</span>
                    {cert.blockchain_tx && (
                      <button
                        onClick={() => copyText(cert.blockchain_tx!, 'tx')}
                        className="text-[var(--vc-accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <Copy size={11} /> {copiedField === 'tx' ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--vc-accent)] break-all">
                    {cert.blockchain_tx || 'Registered locally (pending on-chain dispatch)'}
                  </div>
                  {cert.block_number && (
                    <div className="text-[10px] text-[var(--vc-text-muted)] mt-1 font-mono">
                      Block Height: #{cert.block_number}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)]">
                  <div className="text-[11px] text-[var(--vc-text-muted)] mb-1">
                    Authorized Issuer Wallet
                  </div>
                  <div className="font-mono text-[11px] text-[var(--vc-text-primary)] break-all">
                    {cert.issuer_wallet}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Direct Scan Card */}
          <div className="p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <QRCodeSVG
                value={cert.qr_url || `http://localhost:5173/verify/${cert.certificate_id}`}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <div className="text-xs font-bold text-[var(--vc-text-primary)]">
                Instant Verification QR
              </div>
              <p className="text-[11px] text-[var(--vc-text-muted)] mt-0.5">
                Scan with any smartphone camera or employer scanner to verify instantly.
              </p>
            </div>

            <button
              onClick={() => copyText(cert.qr_url || `http://localhost:5173/verify/${cert.certificate_id}`, 'qr')}
              className="w-full py-2 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-xs font-semibold text-[var(--vc-text-primary)] hover:border-[var(--vc-accent)] inline-flex items-center justify-center gap-1.5"
            >
              <Copy size={13} />
              {copiedField === 'qr' ? 'Copied Verification URL' : 'Copy Verify URL'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
