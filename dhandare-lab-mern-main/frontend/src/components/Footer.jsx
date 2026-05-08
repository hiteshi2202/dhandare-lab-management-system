import { Beaker, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <Beaker className="text-primary" /> Dhandare Lab
            </div>
            <p className="text-gray-400 text-sm">
              Providing accurate and timely diagnostic services with state-of-the-art technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/tests" className="hover:text-primary">Book Tests</Link></li>
              <li><Link to="/ai" className="hover:text-primary">AI Assistant</Link></li>
              <li><Link to="/login" className="hover:text-primary">Patient Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><MapPin className="w-10 h-10"/> Dhandare Laboratory 1, Shanta Durga Complex, A Wing, near Patkar Clinic, Mahim Road, Palghar (W) – 401404 </li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4"/>  +91 9923317486</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4"/>dhandarelab@gmail.com</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition"><Facebook className="w-4 h-4"/></a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition"><Twitter className="w-4 h-4"/></a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition"><Instagram className="w-4 h-4"/></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 Dhandare Diagnostic Lab. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;