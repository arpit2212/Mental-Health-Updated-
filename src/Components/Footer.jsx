import React from 'react';
import { Heart, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-teal-400">Mindful</span>Vista
            </h3>
            <p className="text-gray-300 mb-6">
              Dedicated to helping you free yourself from unwanted thoughts and strengthen your mental health.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-teal-400 transition-colors">Home</a></li>
              <li><a href="/Meditation" className="text-gray-300 hover:text-teal-400 transition-colors">Meditation</a></li>
              <li><a href="/chatbot" className="text-gray-300 hover:text-teal-400 transition-colors">Chat Bot</a></li>
              <li><a href="/fun" className="text-gray-300 hover:text-teal-400 transition-colors">Games</a></li>
              <li><a href="/Planner" className="text-gray-300 hover:text-teal-400 transition-colors">Planner</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/food" className="text-gray-300 hover:text-teal-400 transition-colors">Nutrition</a></li>
              <li><a href="/Exercise" className="text-gray-300 hover:text-teal-400 transition-colors">Exercise</a></li>
              <li><a href="/Videos" className="text-gray-300 hover:text-teal-400 transition-colors">Mental Health Videos</a></li>
              <li><a href="/Books" className="text-gray-300 hover:text-teal-400 transition-colors">Books & Reading</a></li>
              <li><a href="/diary" className="text-gray-300 hover:text-teal-400 transition-colors">Journaling</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone size={18} className="mr-2 text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">9111456393</span>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="mr-2 text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">support@mindfulvista.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">SRM Chennai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold text-teal-400">Stay Connected</h3>
              <p className="text-gray-300 mt-2">Subscribe to our newsletter for mental wellness tips.</p>
            </div>
            <div className="md:col-span-2">
              <form  onSubmit={(e) => {
    e.preventDefault(); // Prevents page reload
    alert("You have successfully subscribed to our newsletter and updates!");
  }} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 flex-grow"
                />
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MindfulVista. All rights reserved.
          </p>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">Made with</span>
            <Heart size={16} className="text-teal-400" />
            <span className="text-gray-400 text-sm ml-2">from Arpit And Rhea </span>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;