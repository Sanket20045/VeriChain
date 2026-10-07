// Verification types
export type VerificationMethod = 'qr' | 'upload' | 'id';
export type VerificationStatus = 'valid' | 'suspicious' | 'invalid' | 'revoked' | 'not_found';
export type RiskLevel = 'low' | 'medium' | 'high';

export type VerificationStage =
  | 'IDLE'
  | 'IDENTIFYING'
  | 'BLOCKCHAIN_CHECK'
  | 'HASH_CHECK'
  | 'OCR_ANALYSIS'
  | 'AI_ANALYSIS'
  | 'COMPLETED'
  | 'ERROR';

export interface VerificationResult {
  final_status: VerificationStatus;
  certificate_id: string;
  certificate?: {
    certificate_id: string;
    student_name: string;
    student_id: string;
    certificate_type: string;
    course: string;
    department: string;
    college_name: string;
    issue_date: string;
    status: string;
    issuer_wallet: string;
    document_hash: string;
    ipfs_cid?: string;
    blockchain_tx?: string;
    qr_url?: string;
  };
  explanation: string;
  blockchain_found: boolean;
  hash_match: boolean | null;
  issuer_verified: boolean | null;
  document_hash_registered?: string;
  document_hash_uploaded?: string;
  blockchain_tx?: string;
  block_number?: number;
  ocr_match?: boolean | null;
  ocr_fields?: Record<string, string> | null;
  ai_score?: number | null;
  ai_risk_level?: RiskLevel | null;
  ai_findings?: string[];
}

export interface VerificationLog {
  id: string;
  certificate_id: string;
  verification_method: VerificationMethod;
  hash_match: boolean | null;
  issuer_match: boolean | null;
  blockchain_found: boolean | null;
  ai_score: number | null;
  ai_risk_level: RiskLevel | null;
  final_result: VerificationStatus;
  explanation: string | null;
  verified_at: string;
}
