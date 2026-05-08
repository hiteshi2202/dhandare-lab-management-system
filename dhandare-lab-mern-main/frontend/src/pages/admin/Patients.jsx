import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { Search, User } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // 1. GET TOKEN FROM STORAGE
        const token = localStorage.getItem('token');
        
        // 2. IF NO TOKEN, STOP HERE
        if (!token) {
            setError("No authentication token found. Please log in.");
            setLoading(false);
            return;
        }

        // 3. SEND TOKEN IN HEADERS
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const res = await axios.get('http://localhost:5000/api/admin/patients', config);
        setPatients(res.data);
      } catch (err) {
        console.error("Error fetching patients", err);
        setError('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => 
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Registered Patients</h2>
            
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
            </div>
        </div>

        {loading ? (
            <p className="text-gray-500">Loading patients...</p>
        ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Phone</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient) => (
                            <tr key={patient._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <User size={16} />
                                    </div>
                                    <span className="font-medium text-gray-700">{patient.fullName}</span>
                                </td>
                                <td className="p-4 text-gray-600">{patient.email}</td>
                                <td className="p-4 text-gray-600">{patient.phone}</td>
                                <td className="p-4">
                                    {patient.isVerified ? (
                                        <span className="status-badge-success">Verified</span>
                                    ) : (
                                        <span className="status-badge-pending">Pending</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No patients found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
};

export default Patients;