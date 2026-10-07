import { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  Copy
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api, type IssuerItem } from '../services/api';
import { shortenAddress } from '../lib/utils';

export default function Issuers() {
  const [issuers, setIssuers] = useState<IssuerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  async function loadIssuers() {
    try {
      setLoading(true);
      const data = await api.getIssuers();
      setIssuers(data.issuers);
    } catch (err) {
      console.error('Failed to load issuers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssuers();
  }, []);

  async function handleAddIssuer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !walletAddress.trim()) {
      setFormError('Name and wallet address are required.');
      return;
    }
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setFormError('Please enter a valid Ethereum hex address (0x... 42 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await api.addIssuer({
        name: name.trim(),
        wallet_address: walletAddress.trim(),
        email: email.trim() || undefined,
      });
      setShowAddModal(false);
      setName('');
      setWalletAddress('');
      setEmail('');
      await loadIssuers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to authorize issuer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveIssuer(wallet: string) {
    if (!confirm(`Are you sure you want to deactivate issuer permissions for ${shortenAddress(wallet)}?`)) {
      return;
    }
    try {
      await api.removeIssuer(wallet);
      await loadIssuers();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate issuer.');
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedWallet(text);
    setTimeout(() => setCopiedWallet(null), 2000);
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--vc-border-subtle)] pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--vc-text-primary)]">
              Authorized Credential Issuers
            </h1>
            <p className="text-xs text-[var(--vc-text-secondary)] mt-1">
              Institutions, exam cells, and department deans cryptographically authorized to mint diplomas.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--vc-accent)] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-[rgba(99,102,241,0.2)] transition-all w-fit"
          >
            <Plus size={15} />
            Authorize New Issuer
          </button>
        </div>

        {/* Issuers List */}
        <div className="rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--vc-border-subtle)] bg-[rgba(255,255,255,0.01)] text-[11px] font-semibold text-[var(--vc-text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Authority Name</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Wallet Address</th>
                  <th className="py-3 px-4">Role & Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vc-border-subtle)] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--vc-text-muted)]">
                      Fetching authorized authorities...
                    </td>
                  </tr>
                ) : issuers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--vc-text-muted)]">
                      No issuers registered yet.
                    </td>
                  </tr>
                ) : (
                  issuers.map((issuer) => (
                    <tr key={issuer.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--vc-text-primary)] flex items-center gap-2">
                          <ShieldCheck size={15} className="text-[var(--vc-accent)]" />
                          {issuer.name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--vc-text-secondary)]">
                        {issuer.email || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--vc-text-primary)] bg-[var(--vc-surface)] px-2 py-0.5 rounded border border-[var(--vc-border-subtle)]">
                          <span>{shortenAddress(issuer.wallet_address, 8)}</span>
                          <button
                            onClick={() => copyText(issuer.wallet_address)}
                            className="text-[var(--vc-text-muted)] hover:text-[var(--vc-text-primary)]"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                        {copiedWallet === issuer.wallet_address && (
                          <span className="text-[10px] text-[var(--vc-valid)] ml-2">Copied</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          issuer.is_active === 1
                            ? 'bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] border border-[rgba(16,185,129,0.3)]'
                            : 'bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] border border-[rgba(239,68,68,0.3)]'
                        }`}>
                          <CheckCircle2 size={11} />
                          {issuer.is_active === 1 ? 'Authorized' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRemoveIssuer(issuer.wallet_address)}
                          className="p-1.5 rounded-lg bg-[var(--vc-invalid-muted)] text-[var(--vc-invalid)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Issuer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-strong)] shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--vc-accent-muted)] text-[var(--vc-accent)] flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--vc-text-primary)]">
                    Authorize New Issuer
                  </h3>
                  <p className="text-[11px] text-[var(--vc-text-muted)]">
                    Assign cryptographic certificate minting privileges
                  </p>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-[var(--vc-invalid-muted)] border border-[var(--vc-invalid)] text-xs text-[var(--vc-invalid)]">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddIssuer} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1">
                    Institution / Authority Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. FAMT Examination Cell"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1">
                    Issuer Ethereum Wallet Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] font-mono focus:outline-none focus:border-[var(--vc-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exam@famt.ac.in"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowAddModal(false);
                      setFormError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--vc-accent)] text-white hover:opacity-95 shadow-md shadow-[rgba(99,102,241,0.25)]"
                  >
                    {isSubmitting ? 'Authorizing...' : 'Authorize Issuer'}
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
