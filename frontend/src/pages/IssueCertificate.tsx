import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { computeFileSHA256, formatFileSize } from '../lib/utils';

type Step = 1 | 2 | 3 | 4;

export default function IssueCertificate() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [certType, setCertType] = useState('Degree Certificate');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [department, setDepartment] = useState('Computer Science');
  const [collegeName, setCollegeName] = useState('Finolex Academy of Management & Technology');
  const [collegeCode, setCollegeCode] = useState('FAMT');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const issuerWallet = '0x71C84192e3a936a94158428d09559C381F4faC43';

  // File & Hash State
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);

  // Submitting State & Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedResult, setIssuedResult] = useState<{
    certificate_id: string;
    document_hash: string;
    qr_url: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    setIsHashing(true);
    try {
      const hash = await computeFileSHA256(selectedFile);
      setFileHash(hash);
    } catch (e) {
      console.error('Failed to hash file', e);
    } finally {
      setIsHashing(false);
    }
  }

  async function handleSubmitIssuance() {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('student_name', studentName);
    formData.append('student_id', studentId);
    formData.append('certificate_type', certType);
    formData.append('course', course);
    formData.append('department', department);
    formData.append('college_name', collegeName);
    formData.append('college_code', collegeCode);
    formData.append('issue_date', issueDate);
    formData.append('issuer_wallet', issuerWallet);
    formData.append('certificate_file', file);

    try {
      const res = await api.issueCertificate(formData);
      setIssuedResult(res);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to issue certificate.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DashboardLayout role="issuer">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--vc-border-subtle)] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--vc-accent-muted)] border border-[rgba(99,102,241,0.25)] text-xs text-[var(--vc-accent)] font-medium mb-2">
            <Cpu size={14} /> Dual-Anchored Pipeline (AI-Ready + EVM)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--vc-text-primary)]">
            Issue Academic Credential
          </h1>
          <p className="text-sm text-[var(--vc-text-secondary)] mt-1">
            Complete the 4-step wizard to compute cryptographic hash, verify payload, and anchor on-chain.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Metadata' },
            { num: 2, label: 'Document File' },
            { num: 3, label: 'Review & Mint' },
            { num: 4, label: 'Anchored Record' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border transition-all text-center ${
                currentStep === s.num
                  ? 'bg-[var(--vc-accent-muted)] border-[var(--vc-accent)] text-[var(--vc-text-primary)] font-bold'
                  : currentStep > s.num
                  ? 'bg-[var(--vc-valid-muted)] border-[rgba(16,185,129,0.3)] text-[var(--vc-valid)]'
                  : 'bg-[var(--vc-surface-raised)] border-[var(--vc-border-subtle)] text-[var(--vc-text-muted)]'
              }`}
            >
              <div className="text-xs uppercase tracking-wider font-mono">Step 0{s.num}</div>
              <div className="text-xs truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--vc-invalid-muted)] border border-[var(--vc-invalid)] text-xs text-[var(--vc-invalid)]">
            {error}
          </div>
        )}

        {/* STEP 1: Metadata Form */}
        {currentStep === 1 && (
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] space-y-6">
            <h2 className="text-lg font-bold text-[var(--vc-text-primary)]">
              1. Student & Institutional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Student / Roll / PRN Number *
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. FAMT-2022-CS-041"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] font-mono focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Certificate Type
                </label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                >
                  <option value="Degree Certificate">Degree Certificate</option>
                  <option value="Provisional Degree">Provisional Degree</option>
                  <option value="Consolidated Transcript">Consolidated Transcript</option>
                  <option value="Honor Award">Honor Award / Gold Medal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Academic Degree / Course *
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  Official Date of Convocating / Issue
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  College / University Name
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--vc-text-secondary)] mb-1.5">
                  College Code (VC Prefix)
                </label>
                <input
                  type="text"
                  required
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  placeholder="FAMT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] text-sm text-[var(--vc-text-primary)] font-mono uppercase focus:outline-none focus:border-[var(--vc-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--vc-border-subtle)]">
              <button
                type="button"
                disabled={!studentName.trim() || !studentId.trim()}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--vc-accent)] text-white font-semibold text-sm disabled:opacity-40 hover:opacity-95 transition-all shadow-md shadow-[rgba(99,102,241,0.25)]"
              >
                Continue to Document <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: File Upload & Cryptographic Hashing */}
        {currentStep === 2 && (
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] space-y-6">
            <h2 className="text-lg font-bold text-[var(--vc-text-primary)]">
              2. Upload Official Certificate Document
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-[var(--vc-border-strong)] hover:border-[var(--vc-accent)] rounded-2xl p-8 text-center transition-all cursor-pointer bg-[var(--vc-surface)]"
              onClick={() => {
                const el = document.getElementById('cert-upload-input');
                el?.click();
              }}
            >
              <input
                id="cert-upload-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-[var(--vc-accent-muted)] text-[var(--vc-accent)] flex items-center justify-center mx-auto mb-3">
                <UploadCloud size={28} />
              </div>
              <p className="text-sm font-semibold text-[var(--vc-text-primary)]">
                {file ? file.name : 'Click to select or drop certificate file'}
              </p>
              <p className="text-xs text-[var(--vc-text-muted)] mt-1">
                Accepted formats: PDF, PNG, JPG (Max: 10 MB)
              </p>
            </div>

            {/* Live Hashing Status */}
            {file && (
              <div className="p-4 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--vc-text-secondary)]">File: {file.name} ({formatFileSize(file.size)})</span>
                  <span className="text-[var(--vc-valid)] font-semibold">Ready for anchoring</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[var(--vc-text-muted)] uppercase mb-1">
                    Client Computed SHA-256 Digest:
                  </div>
                  <div className="font-mono text-xs text-[var(--vc-accent)] break-all bg-[var(--vc-surface-raised)] p-2 rounded-lg border border-[var(--vc-border-subtle)]">
                    {isHashing ? 'Computing cryptographic digest...' : fileHash}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-[var(--vc-border-subtle)]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)]"
              >
                <ArrowLeft size={16} /> Back to Details
              </button>
              <button
                type="button"
                disabled={!file || isHashing}
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--vc-accent)] text-white font-semibold text-sm disabled:opacity-40 hover:opacity-95 transition-all shadow-md shadow-[rgba(99,102,241,0.25)]"
              >
                Review & Confirm <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Mint */}
        {currentStep === 3 && (
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] space-y-6">
            <h2 className="text-lg font-bold text-[var(--vc-text-primary)]">
              3. Review Payload & Mint Cryptographic Record
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] space-y-2">
                <div className="font-semibold text-[var(--vc-text-muted)] uppercase tracking-wider text-[10px]">
                  Academic Metadata
                </div>
                <div><span className="text-[var(--vc-text-muted)]">Candidate:</span> <strong className="text-[var(--vc-text-primary)]">{studentName}</strong></div>
                <div><span className="text-[var(--vc-text-muted)]">PRN / Roll No:</span> <span className="font-mono text-[var(--vc-text-primary)]">{studentId}</span></div>
                <div><span className="text-[var(--vc-text-muted)]">Degree Type:</span> <span className="text-[var(--vc-text-primary)]">{certType}</span></div>
                <div><span className="text-[var(--vc-text-muted)]">Department:</span> <span className="text-[var(--vc-text-primary)]">{department}</span></div>
                <div><span className="text-[var(--vc-text-muted)]">Institution:</span> <span className="text-[var(--vc-text-primary)]">{collegeName}</span></div>
                <div><span className="text-[var(--vc-text-muted)]">Issue Date:</span> <span className="text-[var(--vc-text-primary)]">{issueDate}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] space-y-2">
                <div className="font-semibold text-[var(--vc-text-muted)] uppercase tracking-wider text-[10px]">
                  Cryptographic Parameters
                </div>
                <div>
                  <span className="text-[var(--vc-text-muted)]">Issuer Authority:</span>
                  <div className="font-mono text-[11px] text-[var(--vc-accent)] break-all mt-0.5">{issuerWallet}</div>
                </div>
                <div>
                  <span className="text-[var(--vc-text-muted)]">Document SHA-256 Digest:</span>
                  <div className="font-mono text-[11px] text-[var(--vc-text-primary)] break-all mt-0.5">{fileHash}</div>
                </div>
                <div>
                  <span className="text-[var(--vc-text-muted)]">Target Ledger:</span>
                  <div className="text-[11px] text-[var(--vc-valid)] mt-0.5">Local Hardhat EVM (Chain ID 31337)</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)] flex items-center gap-3 text-xs text-[var(--vc-text-secondary)]">
              <ShieldCheck size={20} className="text-[var(--vc-accent)] shrink-0" />
              <span>
                Submitting will anchor the document digest into the smart contract and generate a verifiable QR code. This cannot be overwritten once signed.
              </span>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--vc-border-subtle)]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--vc-text-secondary)] hover:text-[var(--vc-text-primary)]"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitIssuance}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--vc-accent)] to-[#4f46e5] text-white font-semibold text-sm hover:opacity-95 transition-all shadow-lg shadow-[rgba(99,102,241,0.3)]"
              >
                {isSubmitting ? 'Registering on Blockchain...' : 'Confirm & Register On-Chain'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Completed & QR Display */}
        {currentStep === 4 && issuedResult && (
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--vc-surface-raised)] border border-[rgba(16,185,129,0.3)] space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[var(--vc-valid-muted)] text-[var(--vc-valid)] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--vc-text-primary)]">
                Certificate Issued & Anchored Successfully!
              </h2>
              <p className="text-xs text-[var(--vc-text-secondary)] mt-1">
                The academic credential is now permanently verifiable on the VeriChain network.
              </p>
            </div>

            {/* Certificate ID & QR Code */}
            <div className="p-6 rounded-2xl bg-[var(--vc-surface)] border border-[var(--vc-border-subtle)] max-w-md mx-auto space-y-4">
              <div className="p-4 bg-white rounded-xl inline-block shadow-md">
                <QRCodeSVG
                  value={issuedResult.qr_url || `http://localhost:5173/verify/${issuedResult.certificate_id}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-[var(--vc-text-muted)] uppercase">
                  Issued Certificate ID
                </div>
                <div className="font-mono text-base font-extrabold text-[var(--vc-accent)] mt-0.5">
                  {issuedResult.certificate_id}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(issuedResult.certificate_id)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] text-xs font-medium text-[var(--vc-text-primary)] hover:border-[var(--vc-accent)] inline-flex items-center gap-1.5"
                >
                  <Copy size={13} /> {copied ? 'Copied!' : 'Copy ID'}
                </button>
                <Link
                  to={`/verify/${issuedResult.certificate_id}`}
                  className="px-3 py-1.5 rounded-lg bg-[var(--vc-accent)] text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Open Verify Page
                </Link>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setStudentName('');
                  setStudentId('');
                  setFile(null);
                  setFileHash('');
                  setIssuedResult(null);
                  setCurrentStep(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-[var(--vc-surface-raised)] border border-[var(--vc-border-subtle)] text-xs font-semibold text-[var(--vc-text-primary)] hover:border-[var(--vc-accent)]"
              >
                Issue Another Certificate
              </button>
              <Link
                to="/issuer/certificates"
                className="px-5 py-2.5 rounded-xl bg-[var(--vc-accent)] text-white text-xs font-semibold hover:opacity-90"
              >
                View in Certificate Directory
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
