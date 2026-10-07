# VeriChain — Academic Credential Verification Platform

VeriChain is a decentralized, dual-anchored academic certificate issuance and verification engine combining **Ethereum EVM Smart Contracts**, **SHA-256 cryptographic document anchoring**, **OCR entity extraction**, and **AI-powered forensic document analysis**.

---

## 🌟 Key Features

- **Decentralized Cryptographic Anchoring**: Issues tamper-proof degree records anchored directly to EVM smart contracts (`CertificateRegistry.sol`).
- **Multi-Channel Verification**:
  - **Instant Certificate ID Lookup**: Direct query against the ledger.
  - **File Upload Verification**: Compares client-side SHA-256 hash against on-chain records to detect modifications.
  - **Live QR Scanner**: Verifies credentials directly via camera or uploaded QR codes.
- **AI & OCR Forensic Analysis**:
  - OCR extraction of student name, PRN / roll number, degree program, department, and conferring institution.
  - Anomaly and tamper risk scoring (0–100) providing supporting advisory evidence.
- **Institutional Admin & Issuer Center**:
  - Multi-tier role-based access control (Admin vs. Authorized Issuers).
  - Multi-step issuance wizard with real-time browser SHA-256 computation and automatic QR code generation.
  - Cryptographic revocation engine with mandatory audit justification reasons.
  - Live verification audit stream and analytics dashboard.

---

## 📁 Repository Structure

```
├── blockchain/         # Hardhat project, Solidity smart contracts, and unit tests
│   ├── contracts/      # CertificateRegistry.sol (OpenZeppelin AccessControl)
│   └── test/           # Automated test suite (10 test cases passing)
├── backend/            # FastAPI Python server with SQLite & async SQLAlchemy
│   ├── app/
│   │   ├── routes/     # Verification, Certificates, Issuers, Dashboard, Auth
│   │   └── services/   # Blockchain, Hashing, OCR pipeline, AI sentinel, IPFS
├── frontend/           # React 19 + TypeScript + Vite + Tailwind CSS design system
│   └── src/
│       ├── pages/      # Landing, Verify, Result, Dashboards, Issuance, History
│       └── components/ # Layouts, QR generator, Charts, Status badges
└── tests/              # End-to-end integration and verification pipeline tests
```

---

## 🚀 Quick Start

### 1. Smart Contracts (Hardhat)
```bash
cd blockchain
npm install
npx hardhat test
```

### 2. Backend API (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Web App (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🛡️ License
MIT License.
