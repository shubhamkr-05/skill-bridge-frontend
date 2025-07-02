import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api/axios';

const Header = ({ setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unseenCount, setUnseenCount] = useState(0);
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

  useEffect(() => {
    const fetchUnseenCount = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications/unseen-count');
          setUnseenCount(res.data.data.count);
        } catch (err) {
          console.error("Failed to fetch unseen count", err);
        }
      }
    };

    fetchUnseenCount();

    // Optional: poll every 30 sec to refresh count
    const interval = setInterval(fetchUnseenCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
        {user && (
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/notifications')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 10-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {unseenCount}
              </span>
            )}
          </div>
        )}

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
                    <Link to="/my-courses" className="block px-4 py-2 hover:bg-gray-100">My Courses</Link>
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
