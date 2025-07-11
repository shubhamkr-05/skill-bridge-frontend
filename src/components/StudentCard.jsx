import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [scheduling, setScheduling] = useState({}); // for scheduling modal

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/appointments/my-students');
      setStudents(data.data);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  const handleSchedule = async (appointmentId) => {
    const { date, time, videoCallLink } = scheduling[appointmentId] || {};
    if (!date || !time || !videoCallLink) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post('/sessions', {
        appointmentId,
        date,
        time,
        videoCallLink
      });
      alert("Session scheduled");
      fetchStudents(); // refresh
    } catch (err) {
      console.error("Failed to schedule session", err);
    }
  };

  const handleTerminate = async (appointmentId) => {
    try {
      await api.patch(`/sessions/${appointmentId}/terminate`);
      alert("Session marked as completed");
      fetchStudents(); // refresh
    } catch (err) {
      console.error("Failed to terminate session", err);
    }
  };

  const handleChange = (appointmentId, field, value) => {
    setScheduling(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Students</h2>

      {students.length === 0 ? (
        <p className="text-center text-gray-500">No active students yet.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {students.map(student => (
            <div
              key={student._id}
              className="bg-white w-72 p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="text-center">
                <img
                  src={student.user.avatar || '/default-avatar.png'}
                  alt="student avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
                <p className="font-semibold text-lg">{student.user.fullName}</p>
                <p className="text-sm text-gray-500">{student.skill}</p>
                <p className="text-sm text-green-600 mt-1">Fee: ₹{student.fee}</p>
              </div>

              <div className="mt-4">
                {student.session ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Scheduled on: <b>{student.session.date}</b> at <b>{student.session.time}</b>
                    </p>
                    <p className="text-xs text-blue-600 break-words mt-1">{student.session.videoCallLink}</p>
                    {!student.session.completed && (
                      <button
                        onClick={() => handleTerminate(student._id)}
                        className="mt-3 bg-red-500 text-white w-full py-1 rounded"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {student.session.completed && (
                      <p className="text-green-500 font-medium mt-2">Completed</p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      className="w-full mb-1 p-1 border rounded"
                      onChange={(e) => handleChange(student._id, 'date', e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full mb-1 p-1 border rounded"
                      onChange={(e) => handleChange(student._id, 'time', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Video call link"
                      className="w-full mb-2 p-1 border rounded"
                      onChange={(e) => handleChange(student._id, 'videoCallLink', e.target.value)}
                    />
                    <button
                      onClick={() => handleSchedule(student._id)}
                      className="bg-green-500 text-white w-full py-1 rounded"
                    >
                      Schedule Session
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudentsPage;
