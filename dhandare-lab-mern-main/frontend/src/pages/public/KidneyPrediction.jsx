import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Stethoscope, Activity, AlertCircle, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

const KidneyPrediction = () => {
  const navigate = useNavigate();
  
  // Exactly 5 fields matching the Python script
  const [formData, setFormData] = useState({
    age: '', bloodPressure: '', creatinine: '', hemoglobin: '', albumin: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    const storedUser = localStorage.getItem('userInfo');
    const token = storedUser ? JSON.parse(storedUser).token : localStorage.getItem('token');
    if (!token) { alert("Login first"); navigate('/login'); return; }

    try {
      // ⚠️ STRICT ORDER: [Age, BP, Creatinine, Hemoglobin, Albumin]
      const payload = {
        age: Number(formData.age),
        bloodPressure: Number(formData.bloodPressure),
        creatinine: Number(formData.creatinine),
        hemoglobin: Number(formData.hemoglobin),
        albumin: Number(formData.albumin)
      };

      const { data } = await axios.post('http://localhost:5000/api/appointments/predict-kidney', payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      setPrediction(data.prediction);
    } catch (err) { 
      alert("Error: " + (err.response?.data?.message || "Backend Failed")); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          <div className="w-full md:w-2/3 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Stethoscope className="text-purple-600 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Kidney Risk AI</h2>
            </div>
            <p className="text-gray-500 mb-8 ml-1">Enter patient vitals to generate an AI-powered nephrology risk analysis.</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Blood Pressure</label>
                <input type="number" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Serum Creatinine</label>
                <input type="number" step="0.1" name="creatinine" value={formData.creatinine} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hemoglobin</label>
                <input type="number" step="0.1" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Albumin (0-5)</label>
                <input type="number" name="albumin" value={formData.albumin} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                <button type="submit" disabled={loading}
                  className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2
                    ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30'}
                  `}>
                  {loading ? (
                    <><Loader2 className="animate-spin w-6 h-6" /> Analyzing Vitals...</>
                  ) : (
                    <><Activity className="w-6 h-6" /> Check Risk</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full md:w-1/3 bg-slate-900 p-8 lg:p-12 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-slate-800 opacity-50 blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {prediction === null ? (
                <>
                  <ShieldCheck className="w-24 h-24 text-slate-600 mb-6" />
                  <h3 className="text-2xl font-bold mb-2">Awaiting Data</h3>
                  <p className="text-slate-400">Fill out the patient vitals and run the analysis to view the AI prediction.</p>
                </>
              ) : prediction === 1 ? (
                <div className="animate-fade-in">
                  <div className="bg-red-500/20 p-6 rounded-full inline-block mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <AlertCircle className="w-20 h-20 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">High Risk Detected</h3>
                  <p className="text-slate-300 text-lg">The AI model indicates a high probability of Chronic Kidney Disease (CKD).</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-green-500/20 p-6 rounded-full inline-block mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="w-20 h-20 text-green-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Low Risk</h3>
                  <p className="text-slate-300 text-lg">The AI model indicates normal renal health based on current vitals.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default KidneyPrediction;