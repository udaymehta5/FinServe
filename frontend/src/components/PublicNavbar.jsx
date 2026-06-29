import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';

const PublicNavbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-white border-b border-brand-green-border shadow-sm">
      <nav className="landing-container">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0 max-w-[120px] md:max-w-none">
            <div className="h-8 w-8 rounded-md bg-brand-green-dark flex items-center justify-center font-bold text-brand-white text-sm">
              FS
            </div>
            <span className="text-lg md:text-xl font-bold text-brand-text-dark tracking-tight">
              Fin<span className="text-brand-green-dark">Serve</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-text-dark hover:bg-brand-green-light transition-colors min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <a
              href="#about"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-text-dark hover:bg-brand-green-light transition-colors min-h-[44px] inline-flex items-center mr-2"
            >
              About
            </a>

            {!loading && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-green-light transition-colors min-h-[44px]"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-green-light border border-brand-green-border flex items-center justify-center">
                    <User className="h-4 w-4 text-brand-green-dark" />
                  </div>
                  <span className="text-sm font-semibold text-brand-text-dark max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-brand-text-mid transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-brand-white border border-brand-green-border rounded-xl shadow-lg py-1 overflow-hidden">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-brand-text-mid hover:bg-brand-green-light transition-colors min-h-[44px]"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand-text-mid hover:bg-brand-green-light transition-colors min-h-[44px]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/register"
                className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center"
              >
                Register
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-brand-text-dark hover:bg-brand-green-light transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-green-border bg-brand-white">
          <div className="landing-container py-4 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => {
                closeMobile();
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-4 py-3 rounded-lg text-sm font-semibold text-brand-text-dark hover:bg-brand-green-light"
            >
              Home
            </Link>
            <a
              href="#about"
              onClick={closeMobile}
              className="px-4 py-3 rounded-lg text-sm font-semibold text-brand-text-dark hover:bg-brand-green-light"
            >
              About
            </a>
            {!loading && user ? (
              <>
                <div className="px-3 py-2 text-sm font-semibold text-brand-text-dark border-b border-brand-green-border mb-1 mt-2">
                  {user.name}
                </div>
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-brand-text-mid hover:bg-brand-green-light min-h-[44px]"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-brand-text-mid hover:bg-brand-green-light min-h-[44px] w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/register"
                onClick={closeMobile}
                className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-semibold text-center mt-2"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
