import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import UploadPaymentPage from './pages/UploadPaymentPage'
import StatusPage from './pages/StatusPage'
import AdminDashboard from './pages/AdminDashboard'
import ScanPage from './pages/ScanPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/upload-bukti" element={<UploadPaymentPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/scan" element={<ScanPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
