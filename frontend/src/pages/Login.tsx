import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Wallet, 
  UserCheck, 
  Building2, 
  ArrowRight, 
  Lock,
  ChevronRight
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
          setTimeout(() => {
            navigate('/issuer');
          }, 800);
          return;
        }
      }
      // Dev simulated connection
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
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-violet-600 selection:text-white">
      {/* Ambient background glows & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Veri<span className="text-violet-400">Chain</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-normal">v1.0</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">Academic Trust Engine</div>
          </div>
        </Link>

        <Link
          to="/verify"
          className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all inline-flex items-center gap-1.5"
        >
          Public Verification <ArrowRight size={13} />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-center justify-center mx-auto text-violet-400 shadow-xl shadow-black/60 relative">
              <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-sm pointer-events-none" />
              <Lock size={24} className="relative z-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Access Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Cryptographic signature authentication for university deans, examination cells, and system administrators.
            </p>
          </div>

          {/* Elevated Glass Card */}
          <div className="p-7 sm:p-9 rounded-3xl bg-[#0e1320]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(124,58,237,0.08)] space-y-6 relative overflow-hidden">
            {/* Top edge glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {/* Primary Action: Web3 Connect */}
            <button
              onClick={handleConnectMetaMask}
              disabled={connecting || walletConnected}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-75 group"
            >
              <Wallet size={18} className="group-hover:rotate-6 transition-transform" />
              {walletConnected
                ? `Connected (${shortenAddress(walletAddress || '', 4)})`
                : connecting
                ? 'Requesting Signature...'
                : 'Connect MetaMask / Hardware Wallet'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0e1320] px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Or Dev Sandbox Roles
              </span>
            </div>

            {/* Quick Demo Access Roles */}
            <div className="space-y-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-violet-500/35 transition-all duration-200 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.15)] group-hover:scale-105 transition-transform">
                    <Building2 size={19} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      Institutional Admin
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">FULL ACCESS</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Live sentinel control, audit logs & issuer approvals</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>

              <button
                onClick={() => handleDemoLogin('issuer')}
                className="w-full p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-emerald-500/35 transition-all duration-200 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform">
                    <UserCheck size={19} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      Authorized Issuer Officer
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">SIGNING KEY</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Mint certificates, compute SHA-256 & revoke credentials</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>
            </div>

            {/* Public Verifier Info Callout */}
            <div className="pt-2 text-center border-t border-white/[0.04]">
              <p className="text-xs text-slate-400">
                Are you an employer or graduate verifying a degree?{' '}
                <Link to="/verify" className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1 transition-colors">
                  Open Public Verifier <ArrowRight size={12} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>VeriChain Cryptographic Authentication Layer · EIP-712 Standard</div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> EVM Connected</span>
          <span>Zero-Knowledge Ready</span>
        </div>
      </footer>
    </div>
  );
}
