import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      setMessage(`OTP sent to ${email}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', { 
        email, 
        otp 
      });
      
      // If success, we get a resetToken. Navigate to reset page.
      const token = res.data.resetToken;
      navigate(`/reset-password/${token}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or Expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-primary">
            {step === 1 ? 'Forgot Password' : 'Verify OTP'}
          </h2>

          <p className="text-gray-600 text-sm text-center mb-6">
            {step === 1 
              ? "Enter your email address to receive a verification code."
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>

          {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700 transition"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enter OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                {loading ? 'Verifying...' : 'Verify & Reset Password'}
              </button>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-500 hover:underline">Change Email?</button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-primary">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;