import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { donor: '/donor', ngo: '/ngo', admin: '/admin' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">🌿</span>
          <span className="font-display text-lg font-bold text-slate-900">FoodShare</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          {user && (
            <NavLink to={roleHome[user.role] || '/'} className={navLinkClass}>Dashboard</NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link to="/login" className="btn-outline">Log in</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-brand-700">
                Hi, {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-outline">Logout</button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass} onClick={() => setOpen(false)}>Contact</NavLink>
            {user && (
              <NavLink to={roleHome[user.role] || '/'} className={navLinkClass} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}
            <hr className="border-slate-100" />
            {!user ? (
              <div className="flex gap-3">
                <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Sign up</Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/profile" className="btn-outline flex-1" onClick={() => setOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="btn-primary flex-1">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
