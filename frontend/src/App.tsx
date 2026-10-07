import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Verify from './pages/Verify';
import VerificationResult from './pages/VerificationResult';
import AdminDashboard from './pages/AdminDashboard';
import IssuerDashboard from './pages/IssuerDashboard';
import IssueCertificate from './pages/IssueCertificate';
import Certificates from './pages/Certificates';
import CertificateDetails from './pages/CertificateDetails';
import Issuers from './pages/Issuers';
import VerificationHistory from './pages/VerificationHistory';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certificateId" element={<Verify />} />
        <Route path="/result" element={<VerificationResult />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/certificates" element={<Certificates />} />
        <Route path="/admin/certificates/:id" element={<CertificateDetails />} />
        <Route path="/admin/issuers" element={<Issuers />} />
        <Route path="/admin/verifications" element={<VerificationHistory />} />

        {/* Issuer routes */}
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/issuer/issue" element={<IssueCertificate />} />
        <Route path="/issuer/certificates" element={<Certificates />} />
        <Route path="/issuer/certificates/:id" element={<CertificateDetails />} />
        <Route path="/issuer/verifications" element={<VerificationHistory />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
