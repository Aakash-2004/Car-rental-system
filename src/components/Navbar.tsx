import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { User } from '../types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
          <Car className="text-primary w-8 h-8" />
          <span>DRIVE<span className="text-primary">SHARE</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors">Browse</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <UserIcon size={16} className="text-primary" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="bg-primary hover:bg-primary/90 text-black px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
