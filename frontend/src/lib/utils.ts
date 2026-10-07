// lib/utils.ts — VeriChain utility helpers
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function shortenHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getRiskColor(level?: string | null): string {
  switch (level?.toLowerCase()) {
    case 'low': return 'var(--vc-valid)';
    case 'medium': return 'var(--vc-suspicious)';
    case 'high': return 'var(--vc-invalid)';
    default: return 'var(--vc-text-muted)';
  }
}

export function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'valid': return 'var(--vc-valid)';
    case 'active': return 'var(--vc-valid)';
    case 'suspicious': return 'var(--vc-suspicious)';
    case 'invalid': return 'var(--vc-invalid)';
    case 'revoked': return 'var(--vc-revoked)';
    case 'not_found': return 'var(--vc-invalid)';
    default: return 'var(--vc-text-muted)';
  }
}

export function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'valid': return 'Certificate Verified';
    case 'suspicious': return 'Verification Requires Attention';
    case 'invalid': return 'Invalid Certificate';
    case 'revoked': return 'Certificate Revoked';
    case 'not_found': return 'Certificate Not Found';
    default: return 'Unknown Status';
  }
}

export function getStatusIcon(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'valid': return '✓';
    case 'suspicious': return '⚠';
    case 'invalid': return '✕';
    case 'revoked': return '⚠';
    case 'not_found': return '✕';
    default: return '?';
  }
}

export async function computeFileSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
