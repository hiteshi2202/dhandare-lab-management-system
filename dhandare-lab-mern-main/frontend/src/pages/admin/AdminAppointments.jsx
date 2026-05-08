import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { Calendar, CheckCircle, XCircle, Clock, Upload, FileText, Trash2, Search, Eye, CreditCard } from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [filterTab, setFilterTab] = useState('All'); 
  const [selectedPayment, setSelectedPayment] = useState(null); 

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get('http://localhost:5000/api/appointments/all', config);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if(!window.confirm(`Mark this appointment as ${newStatus}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status: newStatus }, config);
      alert('Status Updated!');
      fetchAppointments();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to PERMANENTLY delete this appointment?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, config);
      fetchAppointments(); 
    } catch (error) {
      console.error(error);
      alert('Error deleting appointment');
    }
  };

  const handleFileUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file);

    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      await axios.post(`http://localhost:5000/api/appointments/${id}/upload`, formData, config);
      alert('Report Uploaded Successfully!');
      fetchAppointments();
    } catch (error) {
      alert('Upload failed');
    }
  };

  const handleApprovePayment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`http://localhost:5000/api/appointments/${id}/approve-payment`, {}, config);
      
      alert('Payment Verified & Confirmation Email Sent! ✅');
      setSelectedPayment(null); 
      fetchAppointments(); 
    } catch (error) {
      console.error(error);
      alert('Failed to approve payment');
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTab === 'All' ? true : appt.paymentStatus === 'Pending';
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Appointment Manager</h2>
            
            <div className="flex items-center gap-4">
                <div className="flex bg-gray-200 p-1 rounded-lg">
                  <button 
                    onClick={() => setFilterTab('All')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${filterTab === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All Appointments
                  </button>
                  <button 
                    onClick={() => setFilterTab('Pending Approval')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-1 ${filterTab === 'Pending Approval' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Pending Approval
                    {appointments.some(a => a.paymentStatus === 'Pending') && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white"
                    />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b">Patient</th>
                <th className="p-4 border-b">Tests</th>
                <th className="p-4 border-b">Payment</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Report</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-gray-50 border-b last:border-none">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{appt.patientId?.fullName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar size={12}/> {appt.appointmentDate}
                    </div>
                  </td>
                  {/* UPDATED: Map through testIds array */}
                  <td className="p-4 text-sm font-medium">
                    {appt.testIds?.map((test, index) => (
                      <div key={test._id}>{test.name}{index < appt.testIds.length - 1 ? ',' : ''}</div>
                    ))}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {appt.paymentMethod}
                    </div>
                    {appt.paymentMethod === 'Pay Now' && appt.paymentStatus === 'Pending' && (
                      <button 
                        onClick={() => setSelectedPayment(appt)}
                        className="mt-1 flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-xs font-bold transition"
                      >
                        <Eye className="w-3 h-3" /> Verify UPI
                      </button>
                    )}
                    {appt.paymentStatus === 'Verified' && (
                      <span className="mt-1 inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                        Verified ✅
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {appt.status}
                    </span>
                  </td>
          
                  <td className="p-4">
                    {appt.reportUrl ? (
                        <div className="flex items-center gap-3">
                        <a href={`http://localhost:5000${appt.reportUrl}`} target="_blank" className="text-blue-600 flex items-center gap-1 text-sm hover:underline font-medium">
                            <FileText className="w-4 h-4"/> View
                        </a>
                        <div className="relative group">
                            <input 
                            type="file" 
                            accept="application/pdf"
                            className="hidden"
                            id={`edit-file-${appt._id}`}
                            onChange={(e) => handleFileUpload(e, appt._id)}
                            />
                            <label htmlFor={`edit-file-${appt._id}`} className="cursor-pointer text-gray-400 hover:text-orange-500 transition" title="Re-upload Report">
                            <Upload className="w-4 h-4"/>
                            </label>
                        </div>
                        </div>
                    ) : (
                        <div className="relative">
                        <input 
                            type="file" 
                            accept="application/pdf"
                            className="hidden"
                            id={`file-${appt._id}`}
                            onChange={(e) => handleFileUpload(e, appt._id)}
                        />
                        <label htmlFor={`file-${appt._id}`} className="cursor-pointer flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200 font-medium transition">
                            <Upload className="w-3 h-3"/> Upload
                        </label>
                        </div>
                    )}
                  </td>

                  <td className="p-4 flex gap-2">
                    {appt.status !== 'Completed' && (
                      <button onClick={() => updateStatus(appt._id, 'Completed')} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition" title="Mark Completed">
                        <CheckCircle className="w-4 h-4"/>
                      </button>
                    )}
                    {appt.status !== 'Cancelled' && (
                      <button onClick={() => updateStatus(appt._id, 'Cancelled')} className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition" title="Cancel Appointment">
                        <XCircle className="w-4 h-4"/>
                      </button>
                    )}
                    
                    <button onClick={() => handleDelete(appt._id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" title="Delete Permanently">
                        <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-[450px] max-w-full relative">
            <button 
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Payment Verification</h2>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm border border-blue-100">
              <p><strong>Patient:</strong> {selectedPayment.patientId?.fullName}</p>
              {/* UPDATED: Map through testIds array in modal */}
              <p><strong>Tests:</strong> {selectedPayment.testIds?.map(t => t.name).join(', ')}</p>
              <p className="mt-1"><strong>UPI Transaction ID:</strong> <span className="text-blue-700 font-mono text-base">{selectedPayment.transactionId}</span></p>
            </div>

            <p className="text-sm font-bold text-gray-700 mb-2">Patient Screenshot:</p>
            <div className="w-full h-64 bg-gray-100 border rounded flex items-center justify-center overflow-hidden mb-6">
              {selectedPayment.paymentScreenshot ? (
                <img 
                  src={`http://localhost:5000${selectedPayment.paymentScreenshot}`} 
                  alt="Payment Proof" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">No Screenshot Uploaded</span>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedPayment(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button 
                onClick={() => handleApprovePayment(selectedPayment._id)}
                className="flex-1 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition shadow-md"
              >
                Approve & Confirm ✅
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;