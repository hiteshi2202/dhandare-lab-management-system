import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Save data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // --- UPDATED LOGIC HERE ---
      if (res.data.role === 'admin') {
        navigate('/dashboard/admin'); // <--- FIX: Updated to correct admin path
      } else {
        navigate('/dashboard/patient'); 
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> 
      
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Dhandare Lab Login</h2>
          
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              {/* --- ADDED FORGOT PASSWORD LINK HERE --- */}
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't Have An Account? <Link to="/register" className="text-primary cursor-pointer">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;