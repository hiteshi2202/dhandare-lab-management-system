import { Link, useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import Navbar from '../../components/Navbar';
import { ShieldCheck, Clock, Microscope } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate(); // 2. Initialize Hook

  // 3. The Logic: Check for token
  const handleDownloadReport = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in -> Go to Dashboard
      navigate('/dashboard/patient');
    } else {
      // User is NOT logged in -> Go to Login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Dhandare Lab <br/> at Your Convenience
            </h1>
            <p className="text-blue-100 text-lg">
              Trusted by thousands. Get your blood tests done with 100% accuracy and quick reports.
            </p>
            <div className="flex gap-4">
              <Link to="/tests" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                Book a Test
              </Link>
              
              {/* 4. UPDATED BUTTON: Uses onClick logic instead of simple Link */}
              <button 
                onClick={handleDownloadReport} 
                className="border border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Download Report
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            {/* Simple Icon Representation */}
            <div className="bg-white/10 p-10 rounded-full backdrop-blur-md">
              <Microscope className="h-32 w-32 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Dhandare Lab?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="h-10 w-10 text-primary" />}
            title="NABL Certified"
            desc="We follow the highest standards of safety and accuracy in every test."
          />
          <FeatureCard 
            icon={<Clock className="h-10 w-10 text-primary" />}
            title="Fast Reports"
            desc="Get your reports delivered digitally within 24 hours."
          />
          <FeatureCard 
            icon={<Microscope className="h-10 w-10 text-primary" />}
            title="Latest Technology"
            desc="Fully automated labs ensuring zero human error."
          />
        </div>
      </section>
    </div>
  );
};

// Helper Component for the cards
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

export default Home;