import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../api/axios";

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.data || []);
      const count = data.data.filter(n => !n.seen).length;
      setUnseenCount(count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/read/${id}`);
      fetchNotifications(); // Refresh to update seen status and count
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="cursor-pointer relative" onClick={() => setOpen(!open)}>
        <Bell className="text-gray-700" />
        {unseenCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {unseenCount}
          </span>
        )}
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="p-3 font-semibold border-b">Notifications</div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleMarkAsRead(notif._id)}
                className={`p-3 border-b text-sm cursor-pointer hover:bg-gray-100 ${
                  notif.seen ? "bg-white text-gray-700" : "bg-gray-50 text-black font-medium"
                }`}
              >
                {notif.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
