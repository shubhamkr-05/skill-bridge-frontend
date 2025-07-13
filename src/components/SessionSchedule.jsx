import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLocation } from 'react-router-dom';

const SessionSchedulingPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({});
  const location = useLocation();
  const appointmentIdFromURL = new URLSearchParams(location.search).get('appointmentId');

  useEffect(() => {
    const fetchUnscheduledAppointments = async () => {
      try {
        const { data } = await api.get('/appointments/not-scheduled');
        setAppointments(data.data);
      } catch (err) {
        console.error('Failed to fetch unscheduled appointments', err);
      }
    };

    fetchUnscheduledAppointments();
  }, []);


  const handleInputChange = (appointmentId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value,
      },
    }));
  };

  const handleSchedule = async (appointmentId) => {
    const { date, time, videoCallLink } = formData[appointmentId] || {};
    if (!date || !time || !videoCallLink) {
      return alert("Please fill all fields");
    }

    try {
      await api.post('/sessions', {
        appointmentId,
        date,
        time,
        videoCallLink,
      });

      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId ? { ...appt, sessionStatus: 'scheduled' } : appt
        )
      );
      alert("Session scheduled successfully");
    } catch (err) {
      console.error('Failed to schedule session', err);
      alert("Error scheduling session");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Schedule Sessions</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No active students found.</p>
      ) : (
        <div className="grid gap-5">
          {appointments.map((appt) => {
            const isScheduled = appt.sessionStatus === 'scheduled';
            const shouldAutoOpen = appointmentIdFromURL === appt._id;

            return (
              <div
                key={appt._id}
                className="bg-white shadow rounded-xl p-4 border"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={appt.user.avatar || "/default-avatar.png"}
                      className="w-14 h-14 rounded-full object-cover"
                      alt="student avatar"
                    />
                    <div>
                      <p className="font-semibold">{appt.user.fullName}</p>
                      <p className="text-gray-600 text-sm">{appt.skill}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Fee: ₹{appt.fee}
                    </span>
                  </div>
                </div>

                {isScheduled ? (
                  <p className="text-green-600 text-sm font-semibold">
                    ✅ Session Already Scheduled
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="date"
                      className="border rounded p-2"
                      onChange={(e) =>
                        handleInputChange(appt._id, 'date', e.target.value)
                      }
                    />
                    <input
                      type="time"
                      className="border rounded p-2"
                      onChange={(e) =>
                        handleInputChange(appt._id, 'time', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Video Call Link"
                      className="border rounded p-2"
                      onChange={(e) =>
                        handleInputChange(appt._id, 'videoCallLink', e.target.value)
                      }
                    />
                    <button
                      className="bg-green-600 text-white rounded px-4 py-2 mt-2"
                      onClick={() => handleSchedule(appt._id)}
                    >
                      Schedule
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionSchedulingPage;
