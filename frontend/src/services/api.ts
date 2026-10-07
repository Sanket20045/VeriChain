import { API_BASE } from '../lib/utils';
import type { Certificate } from '../types/certificate';
import type { VerificationResult, VerificationLog } from '../types/verification';

export interface DashboardStats {
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  total_verifications: number;
}

export interface IssuerItem {
  id: string;
  name: string;
  email?: string;
  wallet_address: string;
  role: string;
  is_active: number;
  created_at?: string;
}

// Fallback demo data in case backend is offline during preview
const DEMO_STATS: DashboardStats = {
  total_certificates: 1240,
  active_certificates: 1218,
  revoked_certificates: 22,
  total_verifications: 3892,
};

const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    certificate_id: 'VC-FAMT-CSE-2026-0001',
    student_name: 'Aarav Sharma',
    student_id: 'FAMT-2022-CS-041',
    certificate_type: 'Degree Certificate',
    course: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    college_name: 'Finolex Academy of Management & Technology',
    issue_date: '2026-05-18',
    status: 'active',
    issuer_wallet: '0x71C84192e3a936a94158428d09559C381F4faC43',
    document_hash: '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
    blockchain_tx: '0x8f2d5c3104e8b919d3fbc91244bbd978a1c97a8e2682915309ebc673ba71891d',
    block_number: 18492041,
    qr_url: 'http://localhost:5173/verify/VC-FAMT-CSE-2026-0001',
    created_at: '2026-05-18T10:30:00Z',
  },
  {
    id: '2',
    certificate_id: 'VC-FAMT-IT-2026-0002',
    student_name: 'Priya Deshmukh',
    student_id: 'FAMT-2022-IT-018',
    certificate_type: 'Degree Certificate',
    course: 'B.Tech Information Technology',
    department: 'Information Technology',
    college_name: 'Finolex Academy of Management & Technology',
    issue_date: '2026-05-20',
    status: 'active',
    issuer_wallet: '0x71C84192e3a936a94158428d09559C381F4faC43',
    document_hash: '9f83a8b23c21a4f08e3328e4693a401b17d848ee273c50974fa218dbb966de1a',
    blockchain_tx: '0x1c8b3e940aa34172f3d9735d1f8872e49c7162981cb02e88a09f19385bf32aa1',
    block_number: 18492102,
    qr_url: 'http://localhost:5173/verify/VC-FAMT-IT-2026-0002',
    created_at: '2026-05-20T14:15:00Z',
  },
  {
    id: '3',
    certificate_id: 'VC-FAMT-EXTC-2026-0003',
    student_name: 'Rohan Patil',
    student_id: 'FAMT-2022-EX-092',
    certificate_type: 'Degree Certificate',
    course: 'B.Tech Electronics & Telecommunication',
    department: 'Electronics',
    college_name: 'Finolex Academy of Management & Technology',
    issue_date: '2026-06-01',
    status: 'revoked',
    issuer_wallet: '0x71C84192e3a936a94158428d09559C381F4faC43',
    document_hash: 'd41d8cd98f00b204e9800998ecf8427e57c12668b5a034237c1d37b194f1c7e9',
    blockchain_tx: '0x77b4d99e03d415f3cb0aa8936efc71b12480e6113bba3758b299e52c6fca6114',
    block_number: 18493010,
    revocation_reason: 'Degree awarded under duplicate credits error; reissued under new serial number.',
    revoked_at: '2026-06-15T09:00:00Z',
    revoked_by: '0x71C84192e3a936a94158428d09559C381F4faC43',
    qr_url: 'http://localhost:5173/verify/VC-FAMT-EXTC-2026-0003',
    created_at: '2026-06-01T11:00:00Z',
  },
  {
    id: '4',
    certificate_id: 'VC-FAMT-MECH-2026-0004',
    student_name: 'Sneha Kulkarni',
    student_id: 'FAMT-2022-ME-034',
    certificate_type: 'Provisional Degree',
    course: 'B.Tech Mechanical Engineering',
    department: 'Mechanical',
    college_name: 'Finolex Academy of Management & Technology',
    issue_date: '2026-06-10',
    status: 'active',
    issuer_wallet: '0x71C84192e3a936a94158428d09559C381F4faC43',
    document_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    blockchain_tx: '0x33e8a719c2bb20d6f4c919a322194b638f29402ab7b9a5e840132dfaa415d48a',
    block_number: 18494550,
    qr_url: 'http://localhost:5173/verify/VC-FAMT-MECH-2026-0004',
    created_at: '2026-06-10T16:20:00Z',
  },
];

const DEMO_ISSUERS: IssuerItem[] = [
  {
    id: '1',
    name: 'Registrar & Exam Cell',
    email: 'registrar@famt.ac.in',
    wallet_address: '0x71C84192e3a936a94158428d09559C381F4faC43',
    role: 'issuer',
    is_active: 1,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'Dean Academic Affairs',
    email: 'dean.academics@famt.ac.in',
    wallet_address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    role: 'issuer',
    is_active: 1,
    created_at: '2026-01-15T00:00:00Z',
  },
];

const DEMO_LOGS: VerificationLog[] = [
  {
    id: 'log-1',
    certificate_id: 'VC-FAMT-CSE-2026-0001',
    verification_method: 'qr',
    hash_match: true,
    issuer_match: true,
    blockchain_found: true,
    ai_score: 98,
    ai_risk_level: 'low',
    final_result: 'valid',
    explanation: 'The certificate matches the registered college record and is currently active.',
    verified_at: '2026-06-18T10:45:12Z',
  },
  {
    id: 'log-2',
    certificate_id: 'VC-FAMT-EXTC-2026-0003',
    verification_method: 'id',
    hash_match: null,
    issuer_match: true,
    blockchain_found: true,
    ai_score: null,
    ai_risk_level: null,
    final_result: 'revoked',
    explanation: 'This certificate was previously registered but has been revoked by an authorized issuer.',
    verified_at: '2026-06-17T15:22:40Z',
  },
  {
    id: 'log-3',
    certificate_id: 'VC-FAKE-TEST-9999',
    verification_method: 'upload',
    hash_match: false,
    issuer_match: false,
    blockchain_found: false,
    ai_score: 12,
    ai_risk_level: 'high',
    final_result: 'not_found',
    explanation: 'No registered certificate was found for this certificate ID.',
    verified_at: '2026-06-16T12:05:00Z',
  },
];

export const api = {
  // Stats
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return DEMO_STATS;
    }
  },

  // Certificates
  async getCertificates(params?: { status?: string; search?: string }): Promise<{ certificates: Certificate[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status_filter', params.status);
      if (params?.search) query.set('search', params.search);
      const res = await fetch(`${API_BASE}/api/certificates/?${query.toString()}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      let filtered = [...DEMO_CERTIFICATES];
      if (params?.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          c => c.student_name.toLowerCase().includes(q) ||
               c.certificate_id.toLowerCase().includes(q) ||
               c.student_id.toLowerCase().includes(q)
        );
      }
      return { certificates: filtered, total: filtered.length };
    }
  },

  async getCertificate(id: string): Promise<Certificate> {
    try {
      const res = await fetch(`${API_BASE}/api/certificates/${id}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      const found = DEMO_CERTIFICATES.find(c => c.certificate_id === id || c.id === id);
      if (found) return found;
      throw new Error(`Certificate with ID ${id} not found.`);
    }
  },

  async issueCertificate(formData: FormData): Promise<{ certificate_id: string; document_hash: string; qr_url: string }> {
    const res = await fetch(`${API_BASE}/api/certificates/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to issue certificate' }));
      throw new Error(err.detail || 'Failed to issue certificate');
    }
    return await res.json();
  },

  async revokeCertificate(certificateId: string, reason: string, issuerWallet: string): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE}/api/certificates/${certificateId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, issuer_wallet: issuerWallet }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to revoke certificate' }));
      throw new Error(err.detail || 'Failed to revoke certificate');
    }
    return await res.json();
  },

  // Issuers
  async getIssuers(): Promise<{ issuers: IssuerItem[] }> {
    try {
      const res = await fetch(`${API_BASE}/api/issuers/`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return { issuers: DEMO_ISSUERS };
    }
  },

  async addIssuer(payload: { name: string; wallet_address: string; email?: string }): Promise<IssuerItem> {
    const res = await fetch(`${API_BASE}/api/issuers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add issuer' }));
      throw new Error(err.detail || 'Failed to add issuer');
    }
    return await res.json();
  },

  async removeIssuer(walletAddress: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/issuers/${walletAddress}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to remove issuer' }));
      throw new Error(err.detail || 'Failed to remove issuer');
    }
    return await res.json();
  },

  // Verification
  async verifyById(certificateId: string): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/api/verify/id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificate_id: certificateId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Verification failed');
    }
    return await res.json();
  },

  async verifyByUpload(formData: FormData): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/api/verify/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Verification failed');
    }
    return await res.json();
  },

  async getVerificationHistory(params?: { status?: string }): Promise<{ logs: VerificationLog[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('result_filter', params.status);
      const res = await fetch(`${API_BASE}/api/verify/history?${query.toString()}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      let filtered = [...DEMO_LOGS];
      if (params?.status) {
        filtered = filtered.filter(l => l.final_result === params.status);
      }
      return { logs: filtered, total: filtered.length };
    }
  },
};
