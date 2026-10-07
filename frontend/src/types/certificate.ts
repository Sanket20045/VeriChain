// Certificate types
export type CertificateStatus = 'active' | 'revoked' | 'draft';

export interface Certificate {
  id: string;
  certificate_id: string;
  student_name: string;
  student_id: string;
  certificate_type: string;
  course: string;
  department: string;
  college_name: string;
  issue_date: string;
  status: CertificateStatus;
  issuer_wallet: string;
  document_hash: string;
  ipfs_cid?: string;
  blockchain_tx?: string;
  block_number?: number;
  qr_url?: string;
  revocation_reason?: string;
  revoked_at?: string;
  revoked_by?: string;
  created_at: string;
}

export interface IssueCertificatePayload {
  student_name: string;
  student_id: string;
  certificate_type: string;
  course: string;
  department: string;
  college_name: string;
  college_code: string;
  issue_date: string;
  issuer_wallet: string;
  certificate_file: File;
}
