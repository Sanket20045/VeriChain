import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, AlertCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { VerificationResult } from '../types/verification';
import { shortenAddress, shortenHash, formatDate, getStatusColor, getStatusLabel, getStatusIcon } from '../lib/utils';

export default function VerificationResult() {
  const { state } = useLocation();
  const result: VerificationResult | undefined = state?.result;
  const [showTech, setShowTech] = useState(false);

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--vc-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--vc-text-muted)', marginBottom: 16 }}>No verification result found.</p>
          <Link to="/verify" className="vc-btn vc-btn-primary">Verify a Certificate</Link>
        </div>
      </div>
    );
  }

  const status = result.final_status;
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const statusIcon = getStatusIcon(status);
  const cert = result.certificate;

  const resultClass = {
    valid: 'vc-result-valid',
    suspicious: 'vc-result-suspicious',
    invalid: 'vc-result-invalid',
    revoked: 'vc-result-revoked',
    not_found: 'vc-result-invalid',
  }[status] || '';

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ background: 'var(--vc-bg-base)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,13,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--vc-border)',
        padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Veri<span style={{ color: 'var(--vc-accent-light)' }}>Chain</span></span>
        </Link>
        <Link to="/verify" className="vc-btn vc-btn-secondary vc-btn-sm">← Verify Another</Link>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        {/* Main result card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`vc-glass-card ${resultClass}`}
          style={{ padding: 40, marginBottom: 24, textAlign: 'center' }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `${statusColor}18`,
            border: `2px solid ${statusColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '2rem',
          }}>
            {status === 'valid' ? <CheckCircle size={36} color={statusColor} /> :
             status === 'suspicious' ? <AlertTriangle size={36} color={statusColor} /> :
             <XCircle size={36} color={statusColor} />}
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: statusColor, letterSpacing: '0.03em', marginBottom: 8 }}>
            {statusIcon} {statusLabel.toUpperCase()}
          </h1>

          <p style={{ color: 'var(--vc-text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
            {result.explanation}
          </p>

          {cert && (
            <div style={{ display: 'inline-block', background: 'var(--vc-surface-1)', border: '1px solid var(--vc-border)', borderRadius: 10, padding: '12px 24px' }}>
              <p className="vc-font-mono" style={{ fontSize: '0.9rem', color: 'var(--vc-accent-light)', marginBottom: 4 }}>
                {cert.certificate_id}
              </p>
              <p style={{ fontWeight: 600, color: 'var(--vc-text-primary)' }}>{cert.student_name}</p>
              <p style={{ color: 'var(--vc-text-secondary)', fontSize: '0.875rem' }}>{cert.course} · {cert.college_name}</p>
            </div>
          )}
        </motion.div>

        {/* Evidence Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Blockchain Record */}
          <EvidenceCard
            title="Blockchain Record"
            status={result.blockchain_found}
            icon={<Shield size={16} />}
          >
            {result.blockchain_found ? (
              <>
                <EvidenceRow label="Status" value={<span className="vc-badge vc-badge-active">Registered</span>} />
                {result.blockchain_tx && (
                  <EvidenceRow label="Transaction" value={
                    <span className="vc-font-mono" style={{ fontSize: '0.75rem' }}>
                      {shortenHash(result.blockchain_tx)}
                      <button onClick={() => copyText(result.blockchain_tx!)} className="vc-btn vc-btn-ghost vc-btn-sm" style={{ padding: '2px 6px', marginLeft: 6 }}>
                        <Copy size={10} />
                      </button>
                    </span>
                  } />
                )}
                {result.block_number && (
                  <EvidenceRow label="Block" value={`#${result.block_number}`} />
                )}
                {cert?.issuer_wallet && (
                  <EvidenceRow label="Issuer" value={
                    <span className="vc-font-mono" style={{ fontSize: '0.75rem' }}>{shortenAddress(cert.issuer_wallet)}</span>
                  } />
                )}
              </>
            ) : (
              <p style={{ color: 'var(--vc-text-muted)', fontSize: '0.875rem' }}>Not found on blockchain.</p>
            )}
          </EvidenceCard>

          {/* Document Integrity */}
          <EvidenceCard
            title="Document Integrity"
            status={result.hash_match}
            icon={<CheckCircle size={16} />}
          >
            {result.hash_match !== null ? (
              <>
                <div style={{ marginBottom: 8 }}>
                  <p className="vc-text-label" style={{ marginBottom: 4 }}>Registered Hash</p>
                  <p className="vc-font-mono" style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--vc-text-secondary)' }}>
                    {result.document_hash_registered ? shortenHash(result.document_hash_registered, 12) : '—'}
                  </p>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <p className="vc-text-label" style={{ marginBottom: 4 }}>Uploaded Hash</p>
                  <p className="vc-font-mono" style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--vc-text-secondary)' }}>
                    {result.document_hash_uploaded ? shortenHash(result.document_hash_uploaded, 12) : '—'}
                  </p>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: result.hash_match ? 'var(--vc-valid-dim)' : 'var(--vc-invalid-dim)', border: `1px solid ${result.hash_match ? 'var(--vc-valid-border)' : 'var(--vc-invalid-border)'}` }}>
                  <span style={{ color: result.hash_match ? 'var(--vc-valid)' : 'var(--vc-invalid)', fontWeight: 700, fontSize: '0.8rem' }}>
                    {result.hash_match ? '✓ HASH MATCH' : '✕ HASH MISMATCH'}
                  </span>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--vc-text-muted)', fontSize: '0.875rem' }}>No file uploaded for hash verification.</p>
            )}
          </EvidenceCard>
        </div>

        {/* Certificate Details */}
        {cert && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="vc-card" style={{ padding: 24, marginBottom: 16 }}>
            <p className="vc-text-label" style={{ marginBottom: 16 }}>Certificate Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Student', value: cert.student_name },
                { label: 'Student ID', value: cert.student_id },
                { label: 'Certificate Type', value: cert.certificate_type },
                { label: 'Course', value: cert.course },
                { label: 'Department', value: cert.department },
                { label: 'Issue Date', value: formatDate(cert.issue_date) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="vc-text-label" style={{ marginBottom: 4 }}>{label}</p>
                  <p style={{ color: 'var(--vc-text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Analysis */}
        {result.ai_score !== null && result.ai_score !== undefined && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="vc-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p className="vc-text-label" style={{ marginBottom: 4 }}>Document Intelligence</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--vc-text-muted)' }}>
                  AI analysis provides supporting evidence and does not replace blockchain verification.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--vc-surface-2)', borderRadius: 8, border: '1px solid var(--vc-border)' }}>
                <p style={{
                  fontSize: '1.5rem', fontWeight: 700,
                  color: result.ai_risk_level === 'low' ? 'var(--vc-valid)' : result.ai_risk_level === 'medium' ? 'var(--vc-suspicious)' : 'var(--vc-invalid)',
                }}>
                  {result.ai_score}
                </p>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--vc-text-muted)' }}>
                  {result.ai_risk_level || 'LOW'} RISK
                </p>
              </div>
            </div>

            {result.ai_findings && result.ai_findings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.ai_findings.map((finding, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--vc-text-secondary)' }}>
                    {finding.toLowerCase().includes('no significant') ?
                      <CheckCircle size={14} color="var(--vc-valid)" /> :
                      <AlertCircle size={14} color="var(--vc-suspicious)" />
                    }
                    {finding}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Technical Details (collapsible) */}
        {cert && (
          <div className="vc-card">
            <button
              onClick={() => setShowTech(!showTech)}
              style={{
                width: '100%', padding: '16px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vc-text-secondary)',
                fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              <span className="vc-text-label">Technical Details</span>
              {showTech ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showTech && (
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cert.document_hash && (
                  <div>
                    <p className="vc-text-label" style={{ marginBottom: 4 }}>Document Hash (SHA-256)</p>
                    <p className="vc-font-mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--vc-text-secondary)' }}>
                      {cert.document_hash}
                    </p>
                  </div>
                )}
                {cert.ipfs_cid && (
                  <div>
                    <p className="vc-text-label" style={{ marginBottom: 4 }}>IPFS CID</p>
                    <p className="vc-font-mono" style={{ fontSize: '0.75rem', color: 'var(--vc-text-secondary)' }}>{cert.ipfs_cid}</p>
                  </div>
                )}
                {cert.issuer_wallet && (
                  <div>
                    <p className="vc-text-label" style={{ marginBottom: 4 }}>Issuer Wallet</p>
                    <p className="vc-font-mono" style={{ fontSize: '0.75rem', color: 'var(--vc-text-secondary)' }}>{cert.issuer_wallet}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/verify" className="vc-btn vc-btn-ghost vc-btn-sm">Verify Another Certificate</Link>
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({ title, status, icon, children }: {
  title: string;
  status: boolean | null | undefined;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="vc-card" style={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--vc-accent-light)' }}>{icon}</span>
          <span className="vc-text-label">{title}</span>
        </div>
        {status === true && <span style={{ color: 'var(--vc-valid)', fontSize: '0.75rem', fontWeight: 700 }}>✓ VERIFIED</span>}
        {status === false && <span style={{ color: 'var(--vc-invalid)', fontSize: '0.75rem', fontWeight: 700 }}>✕ FAILED</span>}
        {status === null && <span style={{ color: 'var(--vc-text-muted)', fontSize: '0.75rem' }}>—</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </motion.div>
  );
}

function EvidenceRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--vc-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--vc-text-secondary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
