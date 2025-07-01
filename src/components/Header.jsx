import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  // 🔹 Close dropdown on click outside
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

  // 🔹 Close dropdown on route change
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <Link to="/" className="text-2xl font-bold text-green-600">Nidaan</Link>
      <input
        type="text"
        placeholder="Search..."
        className="w-1/3 px-4 py-2 rounded-full border border-gray-300"
      />
      <div className="relative" ref={dropdownRef}>
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
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">View Profile</Link>
                <Link to="/update-profile" className="block px-4 py-2 hover:bg-gray-100">Update Profile</Link>
                <Link to="/change-password" className="block px-4 py-2 hover:bg-gray-100">Change Password</Link>
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
