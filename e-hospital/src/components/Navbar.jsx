import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, User, Calendar, LogOut, Search, Home, Users, HelpCircle, Phone, ShoppingBag, MessageCircle, Heart } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setToken(storedToken);
      setUser(storedUser);
    };

    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const navigationLinks = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/doctors", label: "Doctors", icon: <Users size={18} /> },
    { path: "/find", label: "Search", icon: <Search size={18} /> },
    { path: "/about", label: "About", icon: <HelpCircle size={18} /> },
    { path: "/contact", label: "Contact", icon: <Phone size={18} /> },
    { path: "/pharmacy", label: "Pharmacy", icon: <ShoppingBag size={18} /> },
    { 
      path: "/stress-relief", 
      label: "Stress Relief", 
      icon: <Heart size={18} /> 
    },
  ];

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-5 py-3 transition-all duration-300 z-50 ${
          isScrolled 
            ? "bg-white shadow-lg" 
            : "bg-white/95 border-b border-gray-200"
        }`}
      >
        {/* Logo Container */}
        <div className="flex items-center">
          <img
            className="w-40 md:w-44 cursor-pointer transition-transform hover:scale-105"
            src={assets.logo1}
            alt="CareLink"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-10">
          <ul className="flex items-center space-x-1">
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-medium"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Authentication / Action Buttons */}
        <div className="flex items-center space-x-3 md:space-x-5">
          {token ? (
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-2 hover:bg-blue-100 transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <img 
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" 
                  src={user?.image || assets.profile} // Use user image if available, fallback to default
                  alt={user?.name || "Profile"} 
                />
                <ChevronDown size={16} className={`text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-2 px-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <User size={16} className="mr-3 text-blue-600" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => { navigate('/chat'); setUserMenuOpen(false); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <MessageCircle size={16} className="mr-3 text-blue-600" />
                      Chat
                    </button>
                    <button 
                      onClick={() => { navigate('/appointment'); setUserMenuOpen(false); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <Calendar size={16} className="mr-3 text-blue-600" />
                      My Appointments
                    </button>
                    <button 
                      onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <Calendar size={16} className="mr-3 text-blue-600" />
                      My Orders
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
            >
              <User size={18} className="mr-2" />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed inset-0 z-40 transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <img className="w-32" src={assets.logo1} alt="CareLink" />
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-t border-gray-200">
            {token ? (
              <div className="space-y-2">
                <div className="flex items-center px-4 py-2">
                  <img 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                    src={user?.image || assets.profile}
                    alt={user?.name || "Profile"} 
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <User size={18} className="mr-3 text-blue-600" />
                  My Profile
                </button>
                <button 
                  onClick={() => navigate('/appointment')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Calendar size={18} className="mr-3 text-blue-600" />
                  My Appointments
                </button>
                <button 
                  onClick={() => navigate('/chat')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <MessageCircle size={18} className="mr-3 text-blue-600" />
                  Chat
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <User size={18} className="mr-2" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
