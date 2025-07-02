import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        // Ensuring latest first even if backend missed
        const sorted = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      } catch (err) {
        console.error('Error loading notifications', err);
      }
    };
    fetchNotifications();
  }, []);

  const getTypeClass = (type) => {
    switch (type) {
      case 'appointment_request':
        return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'appointment_accepted':
        return 'border-green-300 bg-green-50 text-green-700';
      case 'appointment_rejected':
        return 'border-red-300 bg-red-50 text-red-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.map(note => (
        <div
          key={note._id}
          className={`p-3 border rounded mb-2 shadow-sm ${getTypeClass(note.type)} ${
            !note.seen ? 'ring-2 ring-yellow-300' : ''
          }`}
        >
          <p className="font-medium">{note.message}</p>
          <small className="text-xs">{new Date(note.createdAt).toLocaleString()}</small>
        </div>
      ))}
      {notifications.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No notifications found.</p>
      )}
    </div>
  );
};

export default NotificationPage;
