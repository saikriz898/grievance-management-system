import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import HelpModal from './HelpModal';


const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogout = () => {
    logout(); // This now handles role-specific redirection
    setIsMenuOpen(false);
  };

  const isAdminArea = location.pathname.startsWith('/admin');
  const isAdminAccess = location.pathname === '/admin-access';
  const isTrackPage = location.pathname === '/track';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-indigo-900/30 to-purple-900/20"></div>
        <nav className={`relative backdrop-blur-3xl border-b-2 shadow-2xl ${
          isAdminArea || isAdminAccess 
            ? 'bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 border-red-400/50' 
            : 'bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-purple-950/90 border-indigo-400/50'
        }`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <div className={`flex items-center space-x-4 group ${!isAuthenticated ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isAuthenticated ? () => navigate('/') : undefined}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-700 ${
                    isAdminArea || isAdminAccess
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-red-500/60'
                      : 'bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-700 shadow-indigo-500/60'
                  }`}>
                    <span className="text-white font-black text-xl">
                      {isAdminArea || isAdminAccess ? '⚡' : '🎯'}
                    </span>
                  </div>
                  <div className={`absolute -inset-2 rounded-2xl opacity-20 group-hover:opacity-40 transition-all duration-700 ${
                    isAdminArea || isAdminAccess
                      ? 'bg-gradient-to-r from-red-400 to-red-600 blur-lg'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-600 blur-lg'
                  }`}></div>
                </div>
                <div className="relative">
                  <span className="text-white font-black text-2xl tracking-wider">
                    {isAdminArea || isAdminAccess ? (
                      <>Admin<span className="text-red-400">Control</span></>
                    ) : (
                      <>Griev<span className="text-indigo-400">AI</span></>
                    )}
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                {isAdminArea || isAdminAccess ? (
                  <>
                    {isAuthenticated && user?.role === 'admin' ? (
                      <>
                        <NavBtn to="/admin" icon="📊" isAdmin={true}>Dashboard</NavBtn>
                        <NavBtn to="/admin/users" icon="👥" isAdmin={true}>Users</NavBtn>
                        <NavBtn to="/admin/analytics" icon="📈" isAdmin={true}>Analytics</NavBtn>
                        <NavBtn to="/admin/settings" icon="⚙️" isAdmin={true}>Settings</NavBtn>
                        <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-red-400/30">
                          <UserAvatar user={user} isAdmin={true} />
                          <LogoutBtn onClick={handleLogout} isAdmin={true} />
                        </div>
                      </>
                    ) : (
                      <>
                        {location.pathname !== '/admin-access' && (
                          <NavBtn to="/admin-access" icon="🔐" isAdmin={true}>Access</NavBtn>
                        )}
                        <Link
                          to="/"
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                          ← Home
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isAuthenticated ? (
                      <>
                        <NavBtn to={user?.role === 'admin' ? '/admin' : '/dashboard'} icon="📊">Dashboard</NavBtn>
                        {user?.role !== 'admin' && (
                          <>
                            <NavBtn to="/submit-grievance" icon="📝">Submit</NavBtn>
                            <NavBtn to="/my-grievances" icon="📋">My Cases</NavBtn>
                            {!isTrackPage && <NavBtn to="/track" icon="🔍">Track</NavBtn>}
                          </>
                        )}
                        {isTrackPage && (
                          <Link
                            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            ← Dashboard
                          </Link>
                        )}
                        <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-indigo-400/30">
                          <UserAvatar user={user} />
                          <LogoutBtn onClick={handleLogout} />
                        </div>
                      </>
                    ) : (
                      <>
                        {!isTrackPage && <NavBtn to="/track" icon="🔍">Track</NavBtn>}
                        {isTrackPage && (
                          <Link
                            to="/"
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            ← Home
                          </Link>
                        )}
                        {location.pathname === '/' && (
                          <Link
                            to="/role-selection"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl"
                          >
                            Get Started 🚀
                          </Link>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                  <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>
            </div>

            {isMenuOpen && (
              <div className="md:hidden py-6 border-t border-white/10">
                <div className="space-y-3">
                  {isAdminArea || isAdminAccess ? (
                    <>
                      {isAuthenticated && user?.role === 'admin' ? (
                        <>
                          <MobileNavItem to="/admin" onClick={() => setIsMenuOpen(false)}>📊 Dashboard</MobileNavItem>
                          <MobileNavItem to="/admin/users" onClick={() => setIsMenuOpen(false)}>👥 Users</MobileNavItem>
                          <MobileNavItem to="/admin/analytics" onClick={() => setIsMenuOpen(false)}>📈 Analytics</MobileNavItem>
                          <MobileNavItem to="/admin/settings" onClick={() => setIsMenuOpen(false)}>⚙️ Settings</MobileNavItem>
                          <div className="pt-4 mt-4 border-t border-red-400/30">
                            <p className="text-red-300 text-sm mb-3 px-4">{user?.name}</p>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium"
                            >
                              Sign out
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {location.pathname !== '/admin-access' && (
                            <MobileNavItem to="/admin-access" onClick={() => setIsMenuOpen(false)}>🔐 Access</MobileNavItem>
                          )}
                          <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="block mx-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center font-bold transition-colors"
                          >
                            ← Home
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {isAuthenticated ? (
                        <>
                          <MobileNavItem to={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)}>📊 Dashboard</MobileNavItem>
                          {user?.role !== 'admin' && (
                            <>
                              <MobileNavItem to="/submit-grievance" onClick={() => setIsMenuOpen(false)}>📝 Submit</MobileNavItem>
                              <MobileNavItem to="/my-grievances" onClick={() => setIsMenuOpen(false)}>📋 My Cases</MobileNavItem>
                              {!isTrackPage && <MobileNavItem to="/track" onClick={() => setIsMenuOpen(false)}>🔍 Track</MobileNavItem>}
                            </>
                          )}
                          {isTrackPage && (
                            <Link
                              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                              onClick={() => setIsMenuOpen(false)}
                              className="block mx-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center font-bold transition-colors"
                            >
                              ← Dashboard
                            </Link>
                          )}
                          <MobileNavItem to="/profile" onClick={() => setIsMenuOpen(false)}>👤 Profile</MobileNavItem>
                          <div className="pt-4 mt-4 border-t border-indigo-400/30">
                            <p className="text-indigo-300 text-sm mb-3 px-4">{user?.name}</p>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium"
                            >
                              Sign out
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {!isTrackPage && <MobileNavItem to="/track" onClick={() => setIsMenuOpen(false)}>🔍 Track</MobileNavItem>}
                          {isTrackPage && (
                            <Link
                              to="/"
                              onClick={() => setIsMenuOpen(false)}
                              className="block mx-4 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-center font-bold transition-colors"
                            >
                              ← Home
                            </Link>
                          )}
                          {location.pathname === '/' && (
                            <Link
                              to="/role-selection"
                              onClick={() => setIsMenuOpen(false)}
                              className="block mx-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-bold transition-colors"
                            >
                              Get Started 🚀
                            </Link>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Help Button - Fixed Bottom Left */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="help-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-110 transition-all duration-300 group"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <span className="text-2xl group-hover:animate-bounce">❓</span>
      </button>

      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
};

const NavBtn = ({ to, children, icon, isAdmin = false }) => (
  <Link
    to={to}
    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 ${
      isAdmin 
        ? 'text-red-300 hover:text-white hover:bg-red-600/30 hover:shadow-lg hover:shadow-red-500/20' 
        : 'text-indigo-300 hover:text-white hover:bg-indigo-600/30 hover:shadow-lg hover:shadow-indigo-500/20'
    }`}
  >
    {icon} {children}
  </Link>
);

const UserAvatar = ({ user, isAdmin = false }) => (
  <Link 
    to="/profile" 
    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110 shadow-lg ${
      isAdmin ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
    }`}
  >
    {user?.name?.charAt(0)}
  </Link>
);

const LogoutBtn = ({ onClick, isAdmin = false }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 ${
      isAdmin 
        ? 'text-red-300 hover:text-white hover:bg-red-600' 
        : 'text-indigo-300 hover:text-white hover:bg-red-600'
    }`}
  >
    Sign out
  </button>
);

const MobileNavItem = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
  >
    {children}
  </Link>
);

export default Navbar;