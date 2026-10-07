import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Wallet, 
  UserCheck, 
  Building2, 
  ArrowRight, 
  Lock,
  ChevronRight,
} from 'lucide-react';
import { shortenAddress } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  async function handleConnectMetaMask() {
    setConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          // Auto route to issuer or admin
          setTimeout(() => {
            navigate('/issuer');
          }, 800);
          return;
        }
      }
      // Demo simulated connection
      setTimeout(() => {
        setWalletAddress('0x71C84192e3a936a94158428d09559C381F4faC43');
        setWalletConnected(true);
        setTimeout(() => {
          navigate('/issuer');
        }, 800);
      }, 700);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  }

  function handleDemoLogin(role: 'admin' | 'issuer') {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/issuer');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--vc-bg-primary)] text-[var(--vc-text-primary)] flex flex-col justify-between selection:bg-[var(--vc-accent)] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-[var(--vc-border-subtle)] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--vc-accent)] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[rgba(99,102,241,0.3)]">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight">VeriChain</div>
            <div className="text-[10px] text-[var(--vc-text-muted)] tracking-wider uppercase font-mono">Academic Trust Engine</div>
          </div>
        </Link>

        <Link
          to="/verify"
          className="text-xs font-semibold text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)] inline-flex items-center gap-1"
        >
          Public Verification <ArrowRight size={13} />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] flex items-center justify-center mx-auto text-[var(--vc-accent)] shadow-xl">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--vc-text-primary)] tracking-tight">
              Institutional Access Portal
            </h1>
            <p className="text-xs text-[var(--vc-text-secondary)] max-w-xs mx-auto">
              Cryptographic signature authentication for university deans, examination cells, and system administrators.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] space-y-5 shadow-2xl">
            {/* Primary Action: Web3 Connect */}
            <button
              onClick={handleConnectMetaMask}
              disabled={connecting || walletConnected}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[var(--vc-accent)] to-[#4f46e5] text-white font-semibold text-xs shadow-lg shadow-[rgba(99,102,241,0.25)] hover:opacity-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-75"
            >
              <Wallet size={16} />
              {walletConnected
                ? `Connected (${shortenAddress(walletAddress || '', 4)})`
                : connecting
                ? 'Requesting Signature...'
                : 'Connect MetaMask / Hardware Wallet'}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--vc-border-subtle)] w-full" />
              <span className="bg-[var(--vc-surface-raised)] px-3 text-[10px] font-bold text-[var(--vc-text-muted)] uppercase tracking-wider">
                Or Dev Sandbox Roles
              </span>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full p-3.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] hover:border-[var(--vc-accent)] transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--vc-accent-muted)] text-[var(--vc-accent)] flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--vc-text-primary)]">Institutional Admin</div>
                    <div className="text-[10px] text-[var(--vc-text-muted)]">Full sentinel control & issuer approvals</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--vc-text-muted)] group-hover:text-[var(--vc-text-primary)] transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => handleDemoLogin('issuer')}
                className="w-full p-3.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] hover:border-[var(--vc-accent)] transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] flex items-center justify-center">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--vc-text-primary)]">Authorized Issuer Officer</div>
                    <div className="text-[10px] text-[var(--vc-text-muted)]">Mint credentials & execute revocations</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--vc-text-muted)] group-hover:text-[var(--vc-text-primary)] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-[var(--vc-text-muted)]">
            Employers & Students don’t need an account. Check any diploma on the{' '}
            <Link to="/verify" className="text-[var(--vc-accent)] hover:underline font-medium">
              Free Verification Engine
            </Link>.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--vc-border-subtle)] px-6 py-4 text-center text-[11px] text-[var(--vc-text-muted)]">
        VeriChain Cryptographic Authentication Layer · Standard EIP-712 Signatures
      </footer>
    </div>
  );
}
