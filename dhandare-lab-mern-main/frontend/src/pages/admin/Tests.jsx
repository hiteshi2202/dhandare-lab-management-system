import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Search } from 'lucide-react'; // Added Search Icon

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ 
    name: '', price: '', sampleType: '', tat: '', description: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // --- NEW: Search State

  const fetchTests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tests');
      setTests(res.data);
    } catch (error) {
      console.error("Error fetching tests");
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (test) => {
    setEditingId(test._id);
    setForm({
      name: test.name,
      price: test.price,
      sampleType: test.sampleType,
      tat: test.tat,
      description: test.description || ''
    });
    window.scrollTo(0,0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', price: '', sampleType: '', tat: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/tests/${editingId}`, form);
        toast.success('Test Updated Successfully!');
      } else {
        await axios.post('http://localhost:5000/api/tests', form);
        toast.success('Test Added Successfully!');
      }
      
      handleCancel();
      fetchTests();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tests/${id}`);
      toast.success("Test Deleted");
      fetchTests();
    } catch (error) {
       toast.error("Delete failed");
    }
  };

  // --- NEW: Filter Logic ---
  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Lab Tests</h2>
            
            {/* --- NEW: Search Bar --- */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
            </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
            {editingId ? 'Edit Test Details' : 'Add New Test'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Test Name" value={form.name} onChange={handleChange} className="p-2 border rounded" required />
            <input type="number" name="price" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="p-2 border rounded" required />
            <input type="text" name="sampleType" placeholder="Sample Type" value={form.sampleType} onChange={handleChange} className="p-2 border rounded" required />
            <input type="text" name="tat" placeholder="TAT (e.g. 24 Hours)" value={form.tat} onChange={handleChange} className="p-2 border rounded" required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-2 border rounded md:col-span-2" />
            
            <div className="md:col-span-2 flex gap-2">
               <button type="submit" className={`flex-1 text-white py-2 px-4 rounded font-semibold ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                 {editingId ? 'Update Test' : '+ Add Test'}
               </button>
               {editingId && (
                 <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                   Cancel
                 </button>
               )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b">Test Name</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Sample</th>
                <th className="p-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Updated to use filteredTests */}
              {filteredTests.map((test) => (
                <tr key={test._id} className="hover:bg-gray-50 border-b last:border-0">
                  <td className="p-4 font-medium">{test.name}</td>
                  <td className="p-4">₹{test.price}</td>
                  <td className="p-4">{test.sampleType}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(test)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-4 h-4"/>
                    </button>
                    <button onClick={() => handleDelete(test._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTests.length === 0 && (
                  <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                          No tests found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Tests;