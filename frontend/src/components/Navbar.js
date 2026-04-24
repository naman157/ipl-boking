import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,107,0,0.15)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      height: 72,
      display: 'flex', alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b00, #ffd700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'Bebas Neue, sans-serif'
          }}>🏏</div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: '0.08em', color: '#fff' }}>
            IPL <span style={{ color: '#ff6b00' }}>TICKETS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          <NavLink to="/matches">Matches</NavLink>
          {user && <NavLink to="/my-bookings">My Tickets</NavLink>}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 14px', background: 'rgba(255,107,0,0.1)',
                borderRadius: 8, border: '1px solid rgba(255,107,0,0.2)'
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff'
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 15 }}>
                  {user.name?.split(' ')[0]}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link to={to} style={{
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 16,
      letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
      color: active ? '#ff6b00' : 'rgba(255,255,255,0.7)',
      borderBottom: active ? '2px solid #ff6b00' : '2px solid transparent',
      paddingBottom: 2, transition: 'all 0.2s'
    }}>
      {children}
    </Link>
  );
}
