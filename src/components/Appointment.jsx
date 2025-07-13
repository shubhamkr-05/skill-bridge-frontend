import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [sessionsByAppointment, setSessionsByAppointment] = useState({});
  const [schedulingForm, setSchedulingForm] = useState({});
  const isMentor = user?.data?.user?.role === 'mentor';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/appointments');
        const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAppointments(sorted);
      } catch (err) {
        console.error('Error loading appointments', err);
      }
    };

    const fetchSessions = async () => {
      try {
        const res = await api.get(isMentor ? '/sessions/mentor' : '/sessions/user');
        const sessionMap = {};
        res.data.data.forEach(session => {
          sessionMap[session.appointmentId] = session;
        });
        setSessionsByAppointment(sessionMap);
      } catch (err) {
        console.error("Error fetching sessions", err);
      }
    };

    fetchAppointments();
    fetchSessions();
  }, [isMentor]);

  const handleInputChange = (id, field, value) => {
    setSchedulingForm(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      }
    }));
  };

  const handleSchedule = async (appointmentId) => {
    const form = schedulingForm[appointmentId];
    if (!form?.date || !form?.time || !form?.videoCallLink) {
      return alert('Please fill in all fields');
    }

    try {
      await api.post('/sessions', {
        appointmentId,
        date: form.date,
        time: form.time,
        videoCallLink: form.videoCallLink
      });

      alert('Session scheduled successfully');

      // Refresh both appointments and sessions
      const { data } = await api.get('/appointments');
      const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(sorted);

      const res = await api.get(isMentor ? '/sessions/mentor' : '/sessions/user');
      const sessionMap = {};
      res.data.data.forEach(session => {
        sessionMap[session.appointmentId] = session;
      });
      setSessionsByAppointment(sessionMap);

      setSchedulingForm(prev => ({ ...prev, [appointmentId]: undefined }));
    } catch (err) {
      console.error('Failed to schedule session', err);
      alert('Error scheduling session');
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Appointment History</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map(appt => {
            const session = sessionsByAppointment[appt._id];

            return (
              <div
                key={appt._id}
                className="bg-white border shadow rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p>
                    {isMentor ? (
                      <>
                        <span className="font-medium">Student:</span> {appt.user.fullName}
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Mentor:</span> {appt.mentor.fullName}
                      </>
                    )}
                  </p>
                  <p><span className="font-medium">Skill:</span> {appt.skill}</p>
                  <p><span className="font-medium">Fee:</span> ₹{appt.fee}</p>

                  {/* Session Display or Scheduling */}
                  {appt.sessionStatus === 'scheduled' && session ? (
                    <p className="text-green-600 text-sm mt-1">
                      ✅ Scheduled for: {new Date(session.date).toLocaleDateString()} at {session.time}
                    </p>
                  ) : isMentor ? (
                    <>
                      {schedulingForm[appt._id] ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="date"
                            className="border rounded p-1 w-full"
                            onChange={(e) => handleInputChange(appt._id, 'date', e.target.value)}
                          />
                          <input
                            type="time"
                            className="border rounded p-1 w-full"
                            onChange={(e) => handleInputChange(appt._id, 'time', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Video Call Link"
                            className="border rounded p-1 w-full"
                            onChange={(e) => handleInputChange(appt._id, 'videoCallLink', e.target.value)}
                          />
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded w-full"
                            onClick={() => handleSchedule(appt._id)}
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSchedulingForm(prev => ({ ...prev, [appt._id]: {} }))}
                          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Schedule Session
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-red-500 mt-1">
                      Session has not been scheduled yet.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-gray-500">
                    {new Date(appt.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    to={isMentor ? '/my-students' : '/my-courses'}
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
