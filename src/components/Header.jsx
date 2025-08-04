import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { MessageCircle } from "lucide-react";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

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
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <span
        className="text-2xl font-bold text-green-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Nidaan
      </span>

      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        {user && (
          <>
            <NotificationsDropdown />

            {/* Chat Icon */}
            <div
              className="cursor-pointer relative"
              onClick={() => navigate("/chat")}
              title="Chat"
            >
              <MessageCircle className="text-gray-700 w-6 h-6" />
            </div>
          </>
        )}

        {!user ? (
          <div className="flex gap-4">
            <Link to="/login" className="text-green-600 font-semibold">
              Login
            </Link>
            <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded">
              Signup
            </Link>
          </div>
        ) : (
          <>
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowMenu((prev) => !prev)}
            />
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow-lg w-56 z-50">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  View Profile
                </Link>
                <Link to="/update-profile" className="block px-4 py-2 hover:bg-gray-100">
                  Update Profile
                </Link>
                <Link to="/change-password" className="block px-4 py-2 hover:bg-gray-100">
                  Change Password
                </Link>

                {user.role === "mentor" && (
                  <>
                    <Link to="/add-skill" className="block px-4 py-2 hover:bg-gray-100">
                      Add Skill
                    </Link>
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      My Students
                    </Link>
                    <Link to="/schedule-session" className="block px-4 py-2 hover:bg-gray-100">
                      Schedule Sessions
                    </Link>
                  </>
                )}

                {user.role === "user" && (
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                    My Mentors
                  </Link>
                )}

                <Link to="/upcoming-sessions" className="block px-4 py-2 hover:bg-gray-100">
                  Upcoming Sessions
                </Link>
                <Link to="/session-history" className="block px-4 py-2 hover:bg-gray-100">
                  Session History
                </Link>

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
