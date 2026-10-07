import { Link } from 'react-router-dom';
import { Shield, CheckCircle, QrCode, Upload, Hash, Brain, ChevronRight, ArrowRight, Lock, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function Landing() {
  return (
    <div style={{ background: 'var(--vc-bg-base)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Public Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,13,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--vc-border)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/verify" className="vc-btn vc-btn-ghost vc-btn-sm">Verify</Link>
          <a href="#how" className="vc-btn vc-btn-ghost vc-btn-sm">How It Works</a>
          <a href="#about" className="vc-btn vc-btn-ghost vc-btn-sm">About</a>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" className="vc-btn vc-btn-secondary vc-btn-sm">Login</Link>
          <Link to="/verify" className="vc-btn vc-btn-primary vc-btn-sm">Verify Certificate</Link>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '100px 32px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Background glows */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '600px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 70%)',
        }} />
        <div className="vc-bg-grid" style={{
          position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
          {/* Left: Text */}
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="vc-badge vc-badge-accent" style={{ marginBottom: 24, display: 'inline-flex' }}>
                <Shield size={12} />
                Blockchain-Powered Certificate Verification
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
              style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Trust,{' '}
              <span className="vc-text-gradient">Verified.</span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
              style={{ fontSize: '1.125rem', color: 'var(--vc-text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              Blockchain-backed verification for college certificates. Instant, cryptographic, and tamper-proof.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/verify" className="vc-btn vc-btn-primary vc-btn-lg">
                <Shield size={18} />
                Verify Certificate
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="vc-btn vc-btn-secondary vc-btn-lg">
                Issue Certificate
                <ChevronRight size={16} />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
              style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
              {[
                { icon: <Lock size={14} />, label: 'Blockchain Secured' },
                { icon: <Hash size={14} />, label: 'SHA-256 Integrity' },
                { icon: <Brain size={14} />, label: 'AI Anomaly Detection' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--vc-text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--vc-accent-light)' }}>{icon}</span>
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero verification card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
            style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroCard />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how" style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="vc-text-label" style={{ marginBottom: 8 }}>Process</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            How Verification Works
          </h2>
          <p style={{ color: 'var(--vc-text-secondary)', marginTop: 12, fontSize: '1rem' }}>
            From certificate issuance to instant verification — powered by blockchain
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, position: 'relative' }}>
          {[
            { step: '01', title: 'College Issues', desc: 'Authorized faculty issues the certificate through VeriChain', icon: <Globe size={20} />, color: 'var(--vc-accent-light)' },
            { step: '02', title: 'Blockchain Record', desc: 'Certificate hash and metadata registered on-chain', icon: <Lock size={20} />, color: 'var(--vc-cyan)' },
            { step: '03', title: 'QR + Certificate', desc: 'Student receives certificate with unique QR verification code', icon: <QrCode size={20} />, color: 'var(--vc-accent-light)' },
            { step: '04', title: 'Verifier Scans', desc: 'Recruiter scans QR or uploads the certificate file', icon: <Upload size={20} />, color: 'var(--vc-cyan)' },
            { step: '05', title: 'Instant Result', desc: 'VALID / SUSPICIOUS / INVALID / REVOKED result with evidence', icon: <CheckCircle size={20} />, color: 'var(--vc-valid)' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="vc-card"
              style={{ padding: 20, textAlign: 'center' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--vc-surface-2)',
                border: `1.5px solid var(--vc-border)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                color: item.color,
              }}>
                {item.icon}
              </div>
              <p className="vc-text-label" style={{ color: item.color, marginBottom: 6 }}>{item.step}</p>
              <p style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>{item.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--vc-text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why VeriChain ─────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="vc-text-label" style={{ marginBottom: 8 }}>Why VeriChain</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            The Future of Trusted Credentials
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              icon: <Lock size={22} />,
              title: 'Blockchain-Backed',
              desc: 'Certificate metadata registered on an immutable blockchain ledger. No central point of failure.',
              color: 'var(--vc-accent-light)',
            },
            {
              icon: <Hash size={22} />,
              title: 'Cryptographic Integrity',
              desc: 'SHA-256 hash of every certificate file. Any modification — even a single character — is detected instantly.',
              color: 'var(--vc-cyan)',
            },
            {
              icon: <QrCode size={22} />,
              title: 'Instant QR Verification',
              desc: 'Recruiters scan a QR code and get a verified result in seconds. No manual college contact needed.',
              color: 'var(--vc-valid)',
            },
            {
              icon: <Globe size={22} />,
              title: 'OCR Field Comparison',
              desc: 'Extracts visible information from the certificate and compares it against the trusted blockchain record.',
              color: 'var(--vc-suspicious)',
            },
            {
              icon: <Brain size={22} />,
              title: 'AI Anomaly Detection',
              desc: 'Supporting AI analysis detects inconsistencies, unusual patterns, and document anomalies.',
              color: 'var(--vc-accent-light)',
            },
            {
              icon: <Zap size={22} />,
              title: 'Public Verification',
              desc: 'Anyone can verify without signing up. The verification process is transparent and evidence-backed.',
              color: 'var(--vc-cyan)',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="vc-card"
              style={{ padding: 28 }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'var(--vc-surface-2)',
                border: '1px solid var(--vc-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--vc-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="vc-glass-card-accent"
          style={{ padding: '56px 40px' }}
        >
          <p className="vc-text-label" style={{ marginBottom: 12 }}>Get Started</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Verify a Certificate Now
          </h2>
          <p style={{ color: 'var(--vc-text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
            No login required. Scan a QR code, upload the certificate, or enter the certificate ID.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/verify" className="vc-btn vc-btn-primary vc-btn-lg">
              <Shield size={18} />
              Verify Certificate
            </Link>
            <Link to="/login" className="vc-btn vc-btn-secondary vc-btn-lg">
              Institutional Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--vc-border)',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--vc-text-muted)', fontSize: '0.875rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} style={{ color: 'var(--vc-accent-light)' }} />
          <span style={{ fontWeight: 600 }}>VeriChain</span>
          <span>— Blockchain Certificate Verification</span>
        </div>
        <span>© 2026 VeriChain. College Mini Project.</span>
      </footer>
    </div>
  );
}

// ── Hero Verification Card ─────────────────────────────────────────
function HeroCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="vc-glass-card-accent"
      style={{ width: 340, padding: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="vc-text-label">Certificate Verification</span>
        <span className="vc-badge vc-badge-accent"><Shield size={10} /> VeriChain</span>
      </div>

      <p className="vc-font-mono" style={{ marginBottom: 20, fontSize: '0.8rem', color: 'var(--vc-accent-light)' }}>
        VC-FAMT-CSE-2026-0001
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Blockchain', status: '✓ Verified', ok: true },
          { label: 'Document Hash', status: '✓ Match', ok: true },
          { label: 'Issuer', status: '✓ Authorized', ok: true },
        ].map(({ label, status, ok }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px',
            background: 'var(--vc-surface-2)',
            borderRadius: 8,
            border: '1px solid var(--vc-border)',
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--vc-text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: ok ? 'var(--vc-valid)' : 'var(--vc-invalid)' }}>
              {status}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', padding: '14px',
        background: 'var(--vc-valid-dim)',
        border: '1px solid var(--vc-valid-border)',
        borderRadius: 10,
      }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--vc-valid)', letterSpacing: '0.05em' }}>
          ✓ CERTIFICATE VERIFIED
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--vc-valid)', opacity: 0.8, marginTop: 4 }}>
          Active · Blockchain Registered
        </p>
      </div>
    </motion.div>
  );
}
