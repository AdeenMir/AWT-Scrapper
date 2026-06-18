import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { Menu, X, Moon, Sun, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isDark, toggle } = useDarkMode();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { path: '/home', label: 'Dashboard' },
    { path: '/reports', label: 'Reports' },
    { path: '/schedules', label: 'Schedules' },
    { path: '/contact', label: 'Contact' }
  ];

  const navClasses = 'sticky top-0 z-50 shadow-soft';

  const textClasses = 'transition-colors duration-300 text-primary';

  const mutedClasses = 'transition-colors duration-300 text-secondary';

  return (
    <nav className={navClasses} style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderBottomColor: 'var(--color-border)',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/home"
            className={`${textClasses} font-bold text-2xl flex items-center gap-2 group`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:-translate-y-1">
              <span className="text-background font-bold text-lg">⚡</span>
            </div>
            <span style={{ color: isDark ? '#f0ede8' : '#3e3b37' }}>
              WebScraper
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium ${mutedClasses} group`}
                style={{
                  color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                    isActive(link.path) ? 'scale-x-100' : ''
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="icon-btn-magical"
              aria-label="Toggle dark mode"
              style={{
                backgroundColor: `rgba(var(--color-primary-rgb), 0.1)`,
                color: 'var(--color-primary)',
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/account"
              className="hidden md:flex icon-btn-magical"
              aria-label="Account settings"
              style={{
                backgroundColor: `rgba(100, 200, 200, 0.1)`,
                color: '#64c8c8',
              }}
              title="Account Settings"
            >
              <User size={20} />
            </Link>

            <button
              onClick={handleLogout}
              className="hidden md:flex icon-btn-magical"
              aria-label="Logout"
              style={{
                backgroundColor: `rgba(255, 107, 107, 0.1)`,
                color: '#ff6b6b',
              }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden icon-btn-magical"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className={`md:hidden pb-4 space-y-2 transition-all duration-300 animate-fade-in`} style={{ backgroundColor: 'var(--color-surface)' }}>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all duration-300 ease-out ${
                  isActive(link.path)
                    ? 'text-accent border border-secondary shadow-soft'
                    : 'text-secondary hover:-translate-y-1 hover:shadow-lg hover:bg-surface-hover'
                }`}
                style={{
                  backgroundColor: isActive(link.path) ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                  borderColor: isActive(link.path) ? 'var(--color-border)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 rounded-lg transition-all duration-300 ease-out text-cyan-400 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(100, 200, 200, 0.1)',
                borderColor: 'transparent',
              }}
            >
              <User size={16} />
              Account Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ease-out text-red-400 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderColor: 'transparent',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
