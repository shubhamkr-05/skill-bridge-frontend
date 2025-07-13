import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api/axios';
import NotificationsDropdown from './NotificationsDropdown'; 

const Header = ({ setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchTerm.trim());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <span
        className="text-2xl font-bold text-green-600 cursor-pointer"
        onClick={() => {
          if (setSearchQuery) setSearchQuery('');
          setSearchTerm('');
          navigate('/');
        }}
      >
        Nidaan
      </span>

      <input
        type="text"
        placeholder="Search mentors or skills..."
        className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 w-64"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
      />

      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        {user && <NotificationsDropdown />} 

        {!user ? (
          <div className="flex gap-4">
            <Link to="/login" className="text-green-600 font-semibold">Login</Link>
            <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded">Signup</Link>
          </div>
        ) : (
          <>
            <img
              src={user.data.user.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowMenu(prev => !prev)}
            />
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow-lg w-48 z-50">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">View Profile</Link>
                <Link to="/update-profile" className="block px-4 py-2 hover:bg-gray-100">Update Profile</Link>
                <Link to="/change-password" className="block px-4 py-2 hover:bg-gray-100">Change Password</Link>
                {user.data.user.role === 'mentor' && (
                  <>
                    <Link to="/add-skill" className="block px-4 py-2 hover:bg-gray-100">Add Skill</Link>
                    <Link to="/my-students" className="block px-4 py-2 hover:bg-gray-100">Students</Link>
                  </>
                )}
                {user.data.user.role === 'user' && (
                  <Link to="/my-courses" className="block px-4 py-2 hover:bg-gray-100">My Courses</Link>
                )}
                <Link to="/appointments" className="block px-4 py-2 hover:bg-gray-100">Appointments</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
