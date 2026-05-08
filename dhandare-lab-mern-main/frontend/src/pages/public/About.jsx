import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Microscope, Award, Users, Clock } from 'lucide-react';

// 1. IMPORT YOUR IMAGE HERE
import labImage from '../../assets/lab_image.jpg'; 

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">About Dhandare Lab</h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg">
          We are committed to providing high-quality diagnostic services with precision and care. 
          Your health is our priority.
        </p>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <StatCard icon={<Microscope className="w-8 h-8"/>} number="1000+" label="Tests Conducted" />
          <StatCard icon={<Users className="w-8 h-8"/>} number="500+" label="Happy Patients" />
          <StatCard icon={<Award className="w-8 h-8"/>} number="20+" label="Years Experience" />
          <StatCard icon={<Clock className="w-8 h-8"/>} number="24 Hrs" label="Fast Reports" />
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          
          {/* LEFT SIDE: CHANGED TO IMAGE */}
          <div className="md:w-1/2">
             <img 
               src={labImage} 
               alt="Dhandare Lab Facility" 
               className="rounded-2xl shadow-lg w-full h-80 object-cover border-4 border-white hover:scale-105 transition duration-500"
             />
          </div>

          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission & Vision</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At Dhandare Lab, our mission is to deliver accurate, reliable, and timely diagnostic results to help doctors and patients make informed health decisions.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We envision a future where high-quality healthcare diagnostics are accessible and affordable for everyone in our community. We continuously upgrade our technology to ensure 100% precision.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const StatCard = ({ icon, number, label }) => (
  <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white">
    <div className="flex justify-center text-blue-600 mb-4">{icon}</div>
    <h3 className="text-3xl font-bold text-gray-800">{number}</h3>
    <p className="text-gray-500">{label}</p>
  </div>
);

export default About;