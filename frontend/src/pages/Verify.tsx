import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Upload, QrCode, Hash, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { computeFileSHA256, formatFileSize, API_BASE } from '../lib/utils';
import type { VerificationResult } from '../types/verification';

type VerifyMethod = 'upload' | 'id' | 'qr';

export default function Verify() {
  const { certificateId: urlCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();
  const [method, setMethod] = useState<VerifyMethod>(urlCertId ? 'id' : 'upload');
  const [certId, setCertId] = useState(urlCertId || '');
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-verify if URL has certificate ID
  useEffect(() => {
    if (urlCertId) {
      setCertId(urlCertId);
    }
  }, [urlCertId]);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStage('Computing SHA-256...');
    const hash = await computeFileSHA256(f);
    setFileHash(hash);
    setStage('');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const runVerification = async () => {
    setError('');
    setLoading(true);

    try {
      let result: VerificationResult;

      if (method === 'upload' || method === 'qr') {
        if (!file && method === 'upload') {
          throw new Error('Please select a certificate file to verify.');
        }
        if (!certId.trim() && method === 'upload') {
          throw new Error('Please enter the certificate ID shown on the certificate.');
        }

        if (method === 'upload' && file) {
          setStage('Calculating document hash...');
          const formData = new FormData();
          formData.append('certificate_id', certId.trim());
          formData.append('certificate_file', file);
          setStage('Checking blockchain record...');
          const res = await fetch(`${API_BASE}/verify/upload`, { method: 'POST', body: formData });
          result = await res.json();
        } else {
          setStage('Checking blockchain record...');
          const res = await fetch(`${API_BASE}/verify/qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ certificate_id: certId.trim() }),
          });
          result = await res.json();
        }
      } else {
        if (!certId.trim()) throw new Error('Please enter a certificate ID.');
        setStage('Looking up certificate record...');
        const res = await fetch(`${API_BASE}/verify/id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificate_id: certId.trim() }),
        });
        result = await res.json();
      }

      // Navigate to results page
      navigate('/result', { state: { result } });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setStage('');
    }
  };

  return (
    <div style={{ background: 'var(--vc-bg-base)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,13,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--vc-border)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Veri<span style={{ color: 'var(--vc-accent-light)' }}>Chain</span>
          </span>
        </Link>
        <Link to="/login" className="vc-btn vc-btn-secondary vc-btn-sm">Institutional Login</Link>
      </nav>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '400px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="vc-badge vc-badge-accent" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Shield size={12} /> Public Verification
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Verify College Certificate
            </h1>
            <p style={{ color: 'var(--vc-text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Check certificate authenticity using blockchain, document integrity and certificate information.
            </p>
          </div>

          {/* Method Tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 28,
            background: 'var(--vc-surface-1)',
            border: '1px solid var(--vc-border)',
            borderRadius: 'var(--vc-radius-lg)',
            padding: 4,
          }}>
            {[
              { key: 'upload', label: 'Upload Certificate', icon: <Upload size={15} /> },
              { key: 'id', label: 'Certificate ID', icon: <Hash size={15} /> },
              { key: 'qr', label: 'QR / ID', icon: <QrCode size={15} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setMethod(key as VerifyMethod)}
                className="vc-btn"
                style={{
                  flex: 1, padding: '8px 12px', fontSize: '0.875rem',
                  background: method === key ? 'var(--vc-surface-3)' : 'transparent',
                  color: method === key ? 'var(--vc-text-primary)' : 'var(--vc-text-muted)',
                  border: method === key ? '1px solid var(--vc-border-accent)' : '1px solid transparent',
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Verification Form */}
          <div className="vc-glass-card" style={{ padding: 32 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={method}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Upload method */}
                {method === 'upload' && (
                  <div>
                    <div
                      className={`vc-dropzone ${dragOver ? 'drag-over' : ''}`}
                      onClick={() => fileRef.current?.click()}
                      onDrop={onDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      style={{ marginBottom: 20 }}
                    >
                      {file ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 10,
                            background: 'var(--vc-accent-dim)',
                            border: '1px solid var(--vc-border-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <File size={22} color="var(--vc-accent-light)" />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                            <p style={{ color: 'var(--vc-text-muted)', fontSize: '0.8rem' }}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          {fileHash && (
                            <div style={{ width: '100%', padding: '8px 12px', background: 'var(--vc-surface-2)', borderRadius: 8, textAlign: 'center' }}>
                              <p className="vc-text-label" style={{ marginBottom: 4 }}>SHA-256</p>
                              <p className="vc-font-mono" style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--vc-text-secondary)' }}>
                                {fileHash}
                              </p>
                            </div>
                          )}
                          <button
                            className="vc-btn vc-btn-ghost vc-btn-sm"
                            onClick={(e) => { e.stopPropagation(); setFile(null); setFileHash(''); }}
                          >
                            <X size={14} /> Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <Upload size={32} style={{ color: 'var(--vc-text-muted)' }} />
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 500, marginBottom: 4 }}>Drop certificate here</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--vc-text-muted)' }}>PDF, PNG, or JPG · Max 10MB</p>
                          </div>
                          <span className="vc-btn vc-btn-secondary vc-btn-sm">Choose File</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                    <label className="vc-label">Certificate ID <span style={{ color: 'var(--vc-text-muted)', fontWeight: 400 }}>(shown on certificate)</span></label>
                    <input
                      className="vc-input vc-input-mono"
                      placeholder="VC-FAMT-CSE-2026-0001"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                    />
                  </div>
                )}

                {/* ID method */}
                {method === 'id' && (
                  <div>
                    <label className="vc-label" style={{ marginBottom: 8, display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--vc-text-primary)' }}>
                      Certificate ID
                    </label>
                    <input
                      className="vc-input vc-input-mono"
                      style={{ fontSize: '1.05rem', padding: '12px 16px' }}
                      placeholder="VC-FAMT-CSE-2026-0001"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runVerification()}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--vc-text-muted)', marginTop: 8 }}>
                      Enter the Certificate ID printed on the certificate document.
                    </p>
                  </div>
                )}

                {/* QR method */}
                {method === 'qr' && (
                  <div>
                    <div style={{
                      border: '1.5px dashed var(--vc-border)',
                      borderRadius: 'var(--vc-radius-lg)',
                      padding: 40, textAlign: 'center',
                      marginBottom: 20,
                      background: 'var(--vc-surface-1)',
                    }}>
                      <QrCode size={48} style={{ color: 'var(--vc-text-muted)', marginBottom: 12 }} />
                      <p style={{ fontWeight: 500, marginBottom: 4 }}>Scan QR Code</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--vc-text-muted)', marginBottom: 16 }}>
                        Use your device camera or paste the certificate ID from the QR
                      </p>
                      <span className="vc-btn vc-btn-secondary vc-btn-sm">Open Camera</span>
                    </div>
                    <label className="vc-label">Or enter Certificate ID from QR</label>
                    <input
                      className="vc-input vc-input-mono"
                      placeholder="VC-FAMT-CSE-2026-0001"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'var(--vc-invalid-dim)', border: '1px solid var(--vc-invalid-border)',
                borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center',
                color: 'var(--vc-invalid)', fontSize: '0.875rem',
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Verify button */}
            <button
              className="vc-btn vc-btn-primary"
              style={{ width: '100%', marginTop: 24, padding: '14px' }}
              onClick={runVerification}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} className="vc-animate-spin" /> {stage || 'Verifying...'}</>
              ) : (
                <><Shield size={18} /> Verify Certificate</>
              )}
            </button>

            {/* Pipeline preview while loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: 24 }}
              >
                <VerificationPipeline stage={stage} />
              </motion.div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--vc-text-muted)', marginTop: 16 }}>
            Verification is free and does not require an account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Verification Pipeline UI ──────────────────────────────────────
const PIPELINE_STEPS = [
  'Identifying certificate',
  'Checking blockchain record',
  'Verifying document hash',
  'Running OCR analysis',
  'AI document analysis',
  'Generating result',
];

function VerificationPipeline({ stage }: { stage: string }) {
  const currentIdx = PIPELINE_STEPS.findIndex(s =>
    stage.toLowerCase().includes(s.split(' ')[0].toLowerCase())
  );

  return (
    <div style={{ padding: '0 4px' }}>
      {PIPELINE_STEPS.map((step, i) => {
        const isDone = i < (currentIdx === -1 ? 0 : currentIdx);
        const isActive = i === (currentIdx === -1 ? 0 : currentIdx);
        return (
          <div key={step}>
            <div className="vc-pipeline-step">
              <div className={`vc-pipeline-icon ${isDone ? 'vc-pipeline-icon-done' : isActive ? 'vc-pipeline-icon-active' : 'vc-pipeline-icon-pending'}`}>
                {isDone ? <CheckCircle size={14} /> : isActive ? <Loader2 size={12} className="vc-animate-spin" /> : <span>{i + 1}</span>}
              </div>
              <span style={{
                fontSize: '0.85rem',
                color: isDone ? 'var(--vc-valid)' : isActive ? 'var(--vc-text-primary)' : 'var(--vc-text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {step}
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && <div className="vc-pipeline-connector" />}
          </div>
        );
      })}
    </div>
  );
}
