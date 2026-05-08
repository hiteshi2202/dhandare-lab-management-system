import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import Hook
import Sidebar from '../../components/Sidebar';
import { Users, FileText, TrendingUp, Clock, X, Send, Calendar, Activity, Search } from 'lucide-react';
import StatusChart from '../../components/StatusChart';

const Dashboard = () => {
  const navigate = useNavigate(); // 2. Initialize Navigation
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    testsConducted: 0,
    totalRevenue: 0,
    recentAppointments: [],
    todayCount: 0 
  });

  const [allAppointments, setAllAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch Stats & Appointments
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', config);
        const apptRes = await axios.get('http://localhost:5000/api/appointments/all', config);
        
        setAllAppointments(apptRes.data);

        // --- MIDNIGHT RESET LOGIC 🌙 ---
        const todayStr = new Date().toDateString(); 
        
        const dailyCount = apptRes.data.filter(app => {
            const dateValue = app.appointmentDate || app.date;
            if (!dateValue) return false;
            const appDateObj = new Date(dateValue);
            return appDateObj.toDateString() === todayStr;
        }).length;

        setStats({
            ...statsRes.data,
            todayCount: dailyCount
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Safe Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toDateString();
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + "1Aa!";
      await axios.post('http://localhost:5000/api/auth/register', {
        fullName: 'New Admin', email: inviteEmail, password: tempPassword, phone: '0000000000', role: 'admin'
      });
      await axios.post('http://localhost:5000/api/auth/forgotpassword', { email: inviteEmail });
      setMessage('Invite sent successfully!');
      setTimeout(() => { setShowModal(false); setMessage(''); }, 2000);
    } catch (error) { setMessage(error.response?.data?.message || 'Error sending invite'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar onAddAdmin={() => setShowModal(true)} />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lab Overview</h2>
          
          {/* 3. NEW BUTTON FOR "ALL APPOINTMENTS" */}
          <button 
            onClick={() => navigate('/admin/all-appointments')}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-indigo-700 flex items-center gap-2 transition font-medium"
          >
            <Search className="w-5 h-5" /> View All Records
          </button>
        </div>

        {/* --- DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex flex-col justify-between h-full gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <StatCard 
                  icon={<Activity className="text-blue-600" />} 
                  title="Appointments Today" 
                  value={stats.todayCount} 
                  color="bg-blue-50 border-blue-200"
                  note="*Resets at midnight"
                />
                <StatCard icon={<Users className="text-indigo-600" />} title="Total Patients" value={stats.totalPatients} color="bg-indigo-50" />
                <StatCard icon={<FileText className="text-purple-600" />} title="Tests Completed" value={stats.testsConducted} color="bg-purple-50" />
                <StatCard icon={<TrendingUp className="text-green-600" />} title="Total Revenue" value={`₹${stats.totalRevenue}`} color="bg-green-50" />
             </div>
          </div>
          <div className="lg:col-span-1 h-full">
            <StatusChart appointments={allAppointments} />
          </div>
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5"/> Recent Appointments
          </h3>
          <div className="space-y-4">
            {stats.recentAppointments?.map((appt) => (
              <div key={appt._id} className="flex justify-between items-center border-b pb-3 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800">{appt.patientId?.fullName || "Guest"}</p>
                  <p className="text-xs text-gray-500">{appt.testId?.name}</p>
                </div>
                <div className="text-right">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                     appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {appt.status}
                   </span>
                   <div className="flex flex-col items-end mt-1.5 gap-0.5">
                       <p className="text-xs text-gray-500 flex items-center gap-1">
                           <Calendar size={10} /> {formatDate(appt.appointmentDate || appt.date)}
                       </p>
                       <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
                           <Clock size={10} /> {appt.time || "10:00 AM"}
                       </p>
                   </div>
                </div>
              </div>
            ))}
            {stats.recentAppointments?.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
          </div>
        </div>
      </main>

      {/* --- ADMIN INVITE MODAL --- */}
      {showModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add New Admin</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleInvite}>
              <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full border p-2 rounded mb-4" placeholder="admin@example.com" />
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color, note }) => (
  <div className={`p-6 rounded-xl shadow-sm border ${color} flex items-center gap-4 h-full`}>
    <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
      {note && <p className="text-xs text-green-600 font-semibold mt-1">{note}</p>}
    </div>
  </div>
);

export default Dashboard;