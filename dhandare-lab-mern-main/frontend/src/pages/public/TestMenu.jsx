import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Search, ShoppingCart, Check } from 'lucide-react'; // <-- Added icons
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../../context/CartContext'; // <-- Imported our new Context

const TestMenu = () => {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  
  // <-- Pulling cart data and addToCart function from Context
  const { cart, addToCart } = useCart(); 

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tests');
        // Only show active tests
        const activeTests = res.data.filter(test => test.isActive);
        setTests(activeTests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tests", error);
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Filter tests based on search
  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Test Catalogue</h1>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-10">
          <input 
            type="text" 
            placeholder="Search for a test (e.g. CBC, Thyroid)..." 
            className="w-full p-4 pl-12 rounded-full border shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-gray-400" />
        </div>

        {/* Loading State */}
        {loading && <p className="text-center text-gray-500">Loading tests...</p>}

        {/* Test Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              // <-- Check if this specific test is already in the cart array
              const isAdded = cart.some((item) => item._id === test._id);

              return (
                <div key={test._id} className="bg-white p-6 rounded-xl shadow-sm border hover:border-primary transition group hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary">{test.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                      {test.sampleType}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {test.description || "No description available."}
                  </p>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500 gap-4">
                    <span>⏱ TAT: {test.tat}</span>
                  </div>

                  <div className="mt-6 flex justify-between items-center border-t pt-4">
                    <span className="text-2xl font-bold text-primary">₹{test.price}</span>
                    
                    {/* <-- Updated Add to Cart Button Logic --> */}
                    <button 
                      className={`px-4 py-2 rounded transition text-sm font-semibold flex items-center gap-2 ${
                        isAdded 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-900 text-white hover:bg-gray-700'
                      }`}
                      onClick={() => isAdded ? navigate('/book') : addToCart(test)} 
                    >
                      {isAdded ? (
                        <> <Check className="w-4 h-4" /> Added </>
                      ) : (
                        <> <ShoppingCart className="w-4 h-4" /> Add to Cart </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results Found */}
        {!loading && filteredTests.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No tests found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMenu;