'use client'
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginModal from './LoginModal';
import Link from 'next/link';
import toast from 'react-hot-toast';


export default function Navbar() {
  const { user, isAuthenticated, isAnonymous, logout, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  // Prevent hydration mismatch by only rendering auth-dependent content on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
  const loadingToast = toast.loading('👋 Logging out...');
  await logout();
  toast.success('✅ Successfully logged out!', { id: loadingToast });
  setShowUserMenu(false);
};

  // Get user display info
  const getUserInfo = () => {
    if (isAnonymous) {
      return {
        name: 'Anonymous User',
        subtitle: 'Guest Access',
        avatar: '👤',
        color: 'from-gray-400 to-gray-600'
      };
    }
    
    if (user?.displayName) {
      return {
        name: user.displayName,
        subtitle: user.email,
        avatar: user.photoURL || user.displayName[0].toUpperCase(),
        color: 'from-blue-500 to-indigo-600'
      };
    }
    
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return {
        name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        subtitle: user.email,
        avatar: user.email[0].toUpperCase(),
        color: 'from-purple-500 to-pink-600'
      };
    }
    
    return {
      name: 'User',
      subtitle: 'Logged In',
      avatar: 'U',
      color: 'from-green-500 to-teal-600'
    };
  };

  const userInfo = isAuthenticated ? getUserInfo() : null;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-3xl transform group-hover:scale-110 transition duration-200">
                🎯
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                  BiasBreaker
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Campus Bias Detection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Home
              </Link>
              
              {mounted && isAuthenticated && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/batch-upload"
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                  >
                    Batch Upload
                  </Link>
                  <Link 
                    href="/upload" 
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Upload
                  </Link>
                  <Link
                    href="/templates"
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                  >
                    Templates
                  </Link>
                  <Link 
                    href="/reports" 
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Reports
                  </Link>
                  <Link
                    href="/analytics"
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/compare"
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                  >
                    Compare
                  </Link>
                </>
              )}
              
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                About
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex items-center text-gray-600 hover:text-blue-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {mounted && !isAuthenticated ? (
                <button
  onClick={() => setShowLoginModal(true)}
  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
>
  Sign In
</button>

              ) : mounted && isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white px-3 py-2 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 bg-gradient-to-br ${userInfo.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
                      {userInfo.avatar.startsWith('http') ? (
                        <img 
                          src={userInfo.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{userInfo.avatar}</span>
                      )}
                    </div>
                    
                    {/* User Info - Desktop */}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-gray-800 leading-tight">
                        {userInfo.name}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        {isAnonymous ? '🔒 Guest' : '✓ Verified'}
                      </div>
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-fadeIn">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 bg-gradient-to-br ${userInfo.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden`}>
                            {userInfo.avatar.startsWith('http') ? (
                              <img 
                                src={userInfo.avatar} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{userInfo.avatar}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">
                              {userInfo.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userInfo.subtitle}
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isAnonymous ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              <span>🔒</span>
                              <span className="font-medium">Anonymous Session</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <span>✓</span>
                              <span className="font-medium">Verified Account</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="text-xl">📊</span>
                          <div>
                            <div className="font-medium">Dashboard</div>
                            <div className="text-xs text-gray-500">View analytics</div>
                          </div>
                        </Link>
                        
                        <Link
                          href="/upload"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="text-xl">📤</span>
                          <div>
                            <div className="font-medium">Upload Email</div>
                            <div className="text-xs text-gray-500">Analyze new content</div>
                          </div>
                        </Link>
                        
                        <Link
                          href="/reports"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="text-xl">📈</span>
                          <div>
                            <div className="font-medium">Reports</div>
                            <div className="text-xs text-gray-500">View all insights</div>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <span className="text-xl">🚪</span>
                          <div className="text-left">
                            <div className="font-medium">Logout</div>
                            <div className="text-xs text-red-500">End your session</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu (Optional - for mobile nav links) */}
        {mounted && isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 px-4 py-3 flex gap-4 overflow-x-auto">
            <Link 
              href="/dashboard" 
              className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link 
              href="/upload" 
              className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap"
            >
              Upload
            </Link>
            <Link 
              href="/reports" 
              className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap"
            >
              Reports
            </Link>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
