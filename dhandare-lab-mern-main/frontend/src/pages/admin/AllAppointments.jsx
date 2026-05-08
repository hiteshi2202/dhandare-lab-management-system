import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar'; // Fixed Path
import { Search, Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- 1. SEARCH LOGIC 🔍 ---
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    
    const results = appointments.filter(app => 
      // Search by Patient Name
      (app.patientId?.fullName || "").toLowerCase().includes(lowerTerm) ||
      // Search by Test Name
      (app.testId?.name || "").toLowerCase().includes(lowerTerm) ||
      // Search by Status
      app.status.toLowerCase().includes(lowerTerm) ||
      // Search by ID
      app._id.toLowerCase().includes(lowerTerm)
    );
    
    setFilteredApps(results);
  }, [searchTerm, appointments]);

  const fetchAppointments = async () => {
    try {
      const storedUser = localStorage.getItem('userInfo'); // Or 'token'
      const token = storedUser ? JSON.parse(storedUser).token : localStorage.getItem('token');
      
      const { data } = await axios.get('http://localhost:5000/api/appointments/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(data);
      setFilteredApps(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setLoading(false);
    }
  };

  // Helper for safe dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toDateString();
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 min-h-screen bg-gray-50">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-600" /> All Appointments
            </h1>
            <p className="text-gray-500 mt-1">Manage and track all patient history</p>
          </div>
          
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search Patient, Test, or Status..." 
              className="pl-10 p-3 border rounded-lg shadow-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Test</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Loading records...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No appointments found.</td></tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    
                    {/* Patient Name */}
                    <td className="px-5 py-4 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          <User size={20} />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 font-bold whitespace-no-wrap">
                            {app.patientId?.fullName || "Guest User"}
                          </p>
                          <p className="text-gray-500 text-xs">{app._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Test Name */}
                    <td className="px-5 py-4 bg-white text-sm">
                      <p className="text-gray-900 font-medium">{app.testId?.name || "General Checkup"}</p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 bg-white text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400"/> {formatDate(app.appointmentDate || app.date)}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <Clock size={14} className="text-gray-400"/> {app.time || "10:00 AM"}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 bg-white text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1
                        ${app.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {app.status === 'Completed' ? <CheckCircle size={12}/> : 
                         app.status === 'Pending' ? <Clock size={12}/> : <XCircle size={12}/>}
                        {app.status}
                      </span>
                    </td>

                    {/* Actions (Placeholder) */}
                    <td className="px-5 py-4 bg-white text-sm">
                       <button className="text-blue-600 hover:text-blue-900 font-semibold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">
                         View Details
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AllAppointments;