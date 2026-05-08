import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // ✅ Import Toaster

const Register = () => {
  const navigate = useNavigate();
  
  // State to control the Pop-up (Modal)
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  // State for loading (to disable buttons while waiting)
  const [loading, setLoading] = useState(false);

  // State for user inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  // State for the OTP code
  const [otp, setOtp] = useState('');

  // --- RESEND TIMER STATE ---
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Handle Input Change for Registration Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- TIMER EFFECT ---
  useEffect(() => {
    let interval;
    // Only run timer if modal is open and timer > 0
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- STEP 1: REGISTER & OPEN POPUP ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        // Success! Open the OTP Pop-out
        toast.success('Registration successful! Check your email.'); // ✅ Green Tick
        setShowOtpModal(true);
        setTimer(600); // Start timer
        setCanResend(false);
      } else {
        toast.error(data.message || 'Registration failed'); // ❌ Red X
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Server connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        // ✅ SUCCESS: Show "Roasted" Green Tick Toast
        toast.success('Verified successfully! Redirecting...');
        
        // Wait 2 seconds so the user sees the success message before moving
        setTimeout(() => {
             navigate('/login'); 
        }, 2000);

      } else {
        // ❌ FAILURE: Show Error Toast with backend message
        toast.error(data.message || 'Incorrect OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Verification failed. Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: RESEND OTP ---
  const handleResendOtp = async () => {
    setLoading(true);
    const toastId = toast.loading('Resending OTP...'); // Show loading spinner

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      
      if (response.ok) {
        toast.success("New OTP sent to your email!", { id: toastId }); // Update spinner to Checkmark
        setTimer(600); // Reset timer to 10 mins
        setCanResend(false);
      } else {
        toast.error("Failed to resend OTP", { id: toastId });
      }
    } catch (error) {
      toast.error("Error resending OTP", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      
      {/* ✅ TOASTER COMPONENT: This renders the notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* === MAIN REGISTRATION FORM === */}
      <div className={`w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md transition-all ${showOtpModal ? 'blur-sm pointer-events-none' : ''}`}>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500">Sign up to get started</p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <input type="text" name="fullName" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
          <input type="email" name="email" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" value={formData.password} onChange={handleChange} required />

          <button type="submit" disabled={loading} className={`w-full px-4 py-2 font-bold text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Sending OTP...' : 'Register Now'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</Link>
        </div>
      </div>

      {/* === THE OTP POP-OUT (MODAL) === */}
      {showOtpModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-center transform transition-all scale-100">
            
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Verify Email</h3>
            <p className="text-gray-600 mb-6 text-sm">
              We sent a 6-digit code to <br/>
              <span className="font-bold text-blue-600">{formData.email}</span>
            </p>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input 
                type="text" 
                maxLength="6"
                className="w-full text-center text-3xl tracking-[10px] border-b-2 border-blue-500 focus:outline-none py-2 font-mono" 
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition duration-200"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              {/* RESEND SECTION */}
              <div className="mt-4">
                {canResend ? (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 underline font-semibold cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Resend code in <span className="font-bold">{formatTime(timer)}</span>
                  </p>
                )}
              </div>

              <button 
                type="button" 
                onClick={() => setShowOtpModal(false)} 
                className="text-xs text-gray-500 underline hover:text-gray-800 block mx-auto mt-2"
              >
                Entered wrong email? Edit
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;