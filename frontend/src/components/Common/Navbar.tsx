import React from 'react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  children?: ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <FaBook /> InternTrain
        </Link>

        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
            <FaHome /> Home
          </Link>
          <Link to="/careers" className="hover:text-blue-200">
            Careers
          </Link>
          <Link to="/courses" className="hover:text-blue-200">
            Courses
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <Link to="/profile" className="hover:text-blue-200 flex items-center gap-1">
                <FaUser /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 flex items-center gap-1"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
