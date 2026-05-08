import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
// FIX: Added Droplet and Activity to imports for the new cards
import { Calendar, Clock, FileText, Download, HeartPulse, Droplet, Activity } from 'lucide-react';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));

    const fetchAppointments = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get('http://localhost:5000/api/appointments/my', config);
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments", error);
      }
    };

    fetchAppointments();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          <span className="bg-blue-100 text-primary px-4 py-2 rounded-full font-medium">
            Patient: {user.fullName}
          </span>
        </div>

        {/* --- Quick Actions Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           
           {/* 1. Heart Risk Card */}
           <Link to="/predict-heart" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition flex items-center gap-4 group">
              <div className="bg-red-100 p-4 rounded-full group-hover:bg-red-200 transition">
                <HeartPulse className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Heart Risk</h3>
                <p className="text-sm text-gray-500">AI-based Analysis</p>
              </div>
           </Link>

           {/* 2. Diabetes Risk Card */}
           <Link to="/predict-diabetes" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition flex items-center gap-4 group">
              <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition">
                <Droplet className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Diabetes Risk</h3>
                <p className="text-sm text-gray-500">Glucose Check</p>
              </div>
           </Link>

           {/* 3. Kidney Risk Card */}
           <Link to="/predict-kidney" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition flex items-center gap-4 group">
              <div className="bg-orange-100 p-4 rounded-full group-hover:bg-orange-200 transition">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Kidney Health</h3>
                <p className="text-sm text-gray-500">Renal Function</p>
              </div>
           </Link>
           
           {/* 4. Book Test Card */}
           <Link to="/tests" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition flex items-center gap-4 group">
              <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-200 transition">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Book Test</h3>
                <p className="text-sm text-gray-500">Schedule Visit</p>
              </div>
           </Link>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
            <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
            <button 
              onClick={() => navigate('/tests')}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Book a Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-center">
                
                {/* Left: Details */}
                <div className="flex-1">
                {/* UPDATED LOGIC HERE */}
                <h3 className="text-lg font-bold text-primary">
                {/* 1. Check for the new array first (Multiple tests) */}
                {appt.testIds && appt.testIds.length > 0 
                ? appt.testIds.map(test => test.name).join(', ') 
                /* 2. If no array, check the singular field (Old data/Single test) */
                : appt.testId?.name 
                ? appt.testId.name 
                /* 3. Final fallback */
               : 'Diagnostic Test'}
                </h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {appt.appointmentDate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {appt.appointmentTime}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">ID: {appt._id}</div>
                </div>

                {/* Right: Status & Action */}
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded text-sm font-bold 
                    ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {appt.status}
                  </span>
                  
                  {appt.reportUrl ? (
                    <a 
                      href={`http://localhost:5000${appt.reportUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition shadow-sm"
                    >
                      <Download className="w-4 h-4"/> Download PDF
                    </a>
                  ) : (
                    appt.status === 'Completed' ? (
                        <span className="text-xs text-gray-500 italic">Report uploading...</span>
                    ) : (
                        <span className="text-xs text-gray-400">Wait for Report</span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;