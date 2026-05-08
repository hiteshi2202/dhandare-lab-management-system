import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- PUBLIC PAGES ---
import Home from './pages/public/Home';
import TestMenu from './pages/public/TestMenu';
import AiAssistant from './pages/public/AiAssistant';
import About from './pages/public/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import HeartPrediction from './pages/public/HeartPrediction';
import DiabetesPrediction from './pages/public/DiabetesPrediction';
import KidneyPrediction from './pages/public/KidneyPrediction';
import { CartProvider } from './context/CartContext';

// --- PATIENT PAGES ---
import Booking from './pages/patient/Booking';
import PatientDashboard from './pages/patient/PatientDashboard';

// --- ADMIN PAGES ---
import Dashboard from './pages/admin/Dashboard';
import Tests from './pages/admin/Tests';
import AdminAppointments from './pages/admin/AdminAppointments';
import Patients from './pages/admin/Patients';
import AllAppointments from './pages/admin/AllAppointments';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    // We wrap the entire Router inside the CartProvider here!
    <CartProvider>
      <Router>
        {/* Toast Notifications Container (Shows the popups) */}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<TestMenu />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/predict-heart" element={<HeartPrediction />} />
          <Route path="/predict-diabetes" element={<DiabetesPrediction />} />
          <Route path="/predict-kidney" element={<KidneyPrediction />} />
          
          {/* ================= PATIENT ROUTES ================= */}
          <Route path="/book" element={<Booking />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          
          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/dashboard/admin" element={<Dashboard />} />      
          <Route path="/dashboard/tests" element={<Tests />} />            
          <Route path="/dashboard/appointments" element={<AdminAppointments />} /> 
          <Route path="/dashboard/patients" element={<Patients />} />      
          <Route path="/admin/all-appointments" element={<AllAppointments />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;