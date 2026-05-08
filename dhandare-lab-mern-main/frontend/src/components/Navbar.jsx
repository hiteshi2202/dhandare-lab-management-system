import { Link, useNavigate } from 'react-router-dom';
// Added 'ShoppingCart' to your lucide-react imports
import { Beaker, User, Menu, X, Sparkles, LogOut, LayoutDashboard, HeartPulse, Droplet, Activity, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
// IMPORT THE NEW CART HOOK
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // PULL THE CART FROM OUR NEW CONTEXT
  const { cart } = useCart();

  // Check if user is logged in when the component loads
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Beaker className="h-8 w-8" />
            <span>Dhandare Lab</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-gray-600 hover:text-primary font-medium">Home</Link>
            <Link to="/tests" className="text-gray-600 hover:text-primary font-medium">Book Tests</Link>
            
            {/* ML Feature 1: Heart Risk */}
            <Link to="/predict-heart" className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
               <HeartPulse className="w-4 h-4" /> Heart
            </Link>

            {/* ML Feature 2: Diabetes Risk */}
            <Link to="/predict-diabetes" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
               <Droplet className="w-4 h-4" /> Diabetes
            </Link>

            {/* ML Feature 3: Kidney Risk (FIX 2: Added here) */}
            <Link to="/predict-kidney" className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1">
               <Activity className="w-4 h-4" /> Kidney
            </Link>

            <Link to="/ai" className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> AI Check
            </Link>
            
            <Link to="/about" className="text-gray-600 hover:text-primary font-medium">About Us</Link>

            {/* --- NEW: CART ICON (DESKTOP) --- */}
            <Link to="/book" className="relative p-2 text-gray-600 hover:text-primary transition" title="View Cart">
              <ShoppingCart className="w-5 h-5" />
              {cart && cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            
            {/* DYNAMIC SECTION: If User is Logged In */}
            {user ? (
              <div className="flex items-center gap-4 ml-2">
                <span className="text-sm font-semibold text-gray-700 hidden lg:block">Hi, {user.fullName.split(' ')[0]}</span>
                
                {/* Dashboard Link based on Role */}
                <Link 
                  to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/patient"}
                  className="p-2 text-gray-600 hover:text-primary transition"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition border border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-700 transition ml-2">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4">
          <Link to="/" className="block text-gray-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/tests" className="block text-gray-600" onClick={() => setIsOpen(false)}>Book Tests</Link>
          
          {/* --- NEW: CART ICON (MOBILE) --- */}
          <Link to="/book" className="block text-gray-600 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <ShoppingCart className="w-4 h-4" /> Cart ({cart ? cart.length : 0})
          </Link>

          <Link to="/predict-heart" className="block text-red-600 font-medium" onClick={() => setIsOpen(false)}>
            ❤️ Heart Risk Predictor
          </Link>
          <Link to="/predict-diabetes" className="block text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
            💧 Diabetes Risk Predictor
          </Link>
          {/* FIX 3: Added Kidney Link to Mobile Menu */}
          <Link to="/predict-kidney" className="block text-orange-600 font-medium" onClick={() => setIsOpen(false)}>
            ⚠️ Kidney Risk Predictor
          </Link>
          
          <Link to="/ai" className="block text-purple-600 font-bold" onClick={() => setIsOpen(false)}>✨ AI Health Assistant</Link>
          <Link to="/about" className="block text-gray-600" onClick={() => setIsOpen(false)}>About Us</Link>
          
          {user ? (
            <>
              <Link to={user.role === 'admin' ? "/dashboard/admin" : "/dashboard/patient"} className="block text-primary font-bold" onClick={() => setIsOpen(false)}>My Dashboard</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-red-600 w-full text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block text-primary font-bold" onClick={() => setIsOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;