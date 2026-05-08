import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react'; 
// (If TrendingUp is already imported, just ignore this line)

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100";
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Dhandare Lab</h1>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2">
        <Link to="/dashboard/admin" className={`block py-2 px-4 rounded transition ${isActive('/dashboard/admin')}`}>
          Dashboard Overview
        </Link>
        <Link to="/dashboard/tests" className={`block py-2 px-4 rounded transition ${isActive('/dashboard/tests')}`}>
          Manage Tests
        </Link>
        <Link to="/dashboard/appointments" className={`block py-2 px-4 rounded transition ${isActive('/dashboard/appointments')}`}>
          Appointments
        </Link>
        <Link to="/dashboard/patients" className={`block py-2 px-4 rounded transition ${isActive('/dashboard/patients')}`}>
          Patients
        </Link>
      </nav>
      <button 
          onClick={() => navigate('/admin/analytics')}
          className="flex items-center gap-3 p-3 w-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium"
          >
          <TrendingUp size={20} />
          <span>Analytics </span>
          </button>

      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition font-medium"
        >
           Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;