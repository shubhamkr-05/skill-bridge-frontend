import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../AuthContext';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/appointments');
        setAppointments(data.data);
      } catch (err) {
        console.error('Error loading appointments', err);
      }
    };
    fetchAppointments();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === id ? { ...appt, status } : appt
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <h2 className="text-xl font-bold mb-4">Your Appointments</h2>
      {appointments.map(appt => (
        <div key={appt._id} className="border rounded p-3 mb-3 shadow">
          <p>
            {user.data.user.role === 'mentor'
              ? `User: ${appt.user.fullName}`
              : `Mentor: ${appt.mentor.fullName}`}
          </p>
          <p>Skill: {appt.skill}</p>
          <p>
            Status:
            <span
              className={`inline-block ml-2 px-2 py-1 rounded text-sm font-medium ${getStatusClass(
                appt.status
              )}`}
            >
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
          </p>
          <p>Fee: ₹{appt.fee}</p>

          {user.data.user.role === 'mentor' && appt.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleUpdate(appt._id, 'accepted')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleUpdate(appt._id, 'rejected')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AppointmentsPage;
