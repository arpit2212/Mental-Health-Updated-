import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { 
  useAuth, 
  useClerk,
  useUser,
  SignInButton, 
  UserButton 
} from '@clerk/clerk-react';
import { supabase } from '../services/supabaseClient'; // Import the Supabase client

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const navigate = useNavigate();

  // Fetch Supabase user data when Clerk user is available
  useEffect(() => {
    const fetchSupabaseUser = async () => {
      if (isSignedIn && user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', user.id)
            .single();
          
          setSupabaseUser(data);
        } catch (error) {
          console.error('Error fetching user from Supabase:', error);
        }
      } else {
        setSupabaseUser(null);
      }
    };

    fetchSupabaseUser();
  }, [isSignedIn, user]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    // You could perform any Supabase cleanup here if needed
    // For example, updating last_seen timestamp
    if (isSignedIn && user && supabaseUser) {
      try {
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('clerk_id', user.id);
      } catch (error) {
        console.error('Error updating user in Supabase:', error);
      }
    }
    
    signOut(() => navigate('/'));
  };

  const navItems = [
    { href: "/", label: "HOME", active: true },
    { href: "/chatbot", label: "CHAT BOT" },
    { href: "/Meditation", label: "MEDITATION" },
    { href: "/Planner", label: "PLANNER" },
    { href: "/Exercise", label: "EXERCISE" },
  ];

  // The rest of your component remains the same
  return (
    <div className="bg-[#dce1e3] font-sans">
      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative">
        <div>
          <Link to="/">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-teal-500 cursor-pointer">
              MindfulVista
            </h2>
          </Link>  
        </div>

        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-1 items-center">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className={`px-2 md:px-3 py-2 mx-1 border-l-4 ${
                      item.active 
                        ? "border-teal-500 text-gray-800 font-medium" 
                        : "border-transparent hover:border-teal-500 text-gray-700 hover:text-gray-900"
                    } transition-colors duration-200`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              
              {/* Authentication UI */}
              <li className=" mt-2 relative">
                {isSignedIn ? (
                  <div className="scale-125">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10" // Increased size for the user button
                        }
                      }}
                    />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 border-2 border-teal-500 text-teal-500 rounded-md hover:bg-teal-500 hover:text-white font-medium transition-colors duration-200">
                      LOGIN
                    </button>
                  </SignInButton>
                )}
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden flex flex-col justify-center items-center h-10 w-10 rounded-md hover:bg-gray-200 focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-teal-500 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-teal-500 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-teal-500"></div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile Menu Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-64 sm:w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-medium text-teal-500">Menu</h3>
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index} className="border-b border-gray-100 pb-2">
                <a 
                  href={item.href} 
                  className={`block py-2 px-4 text-lg ${
                    item.active 
                      ? "text-teal-500 font-medium" 
                      : "text-gray-700 hover:text-teal-500"
                  } transition-colors duration-200`}
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </a>
              </li>
            ))}
            
            {/* Authentication in Mobile Menu */}
            <li className="pt-4">
              {isSignedIn ? (
                <div className="flex flex-col space-y-2">
                  <div className="px-4 py-2 flex items-center">
                    <div className="scale-125">
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10" // Increased size for the user button
                          }
                        }}
                      />
                    </div>
                    <span className="ml-3 text-gray-700">
                      {supabaseUser?.username || user?.username || user?.firstName || 'Your Account'}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-2 px-4 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full py-2 px-4 border-2 border-teal-500 text-teal-500 rounded-md hover:bg-teal-500 hover:text-white font-medium transition-colors duration-200">
                    LOGIN
                  </button>
                </SignInButton>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}