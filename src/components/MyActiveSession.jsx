import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const MyActiveSessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get('/sessions/mentor');
        const activeOnly = data.data.filter(s => !s.isCompleted);
        setSessions(activeOnly);
      } catch (err) {
        console.error('Failed to load active sessions', err);
      }
    };

    fetchSessions();
  }, []);

  const handleMarkComplete = async (sessionId) => {
    if (!window.confirm("Are you sure this session is completed?")) return;

    try {
      await api.patch(`/sessions/${sessionId}/complete`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (err) {
      console.error("Failed to mark as complete", err);
      alert("Failed to complete session.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Active Upcoming Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">No active sessions.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white shadow p-4 rounded-xl border">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={session.user.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{session.user.fullName}</p>
                    <p className="text-sm text-gray-600">{session.date} at {session.time}</p>
                  </div>
                </div>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleMarkComplete(session._id)}
                >
                  Mark Completed
                </button>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Skill:</strong> {session.skill || 'N/A'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                <a href={session.videoCallLink} target="_blank" rel="noopener noreferrer">
                  Join Video Call
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActiveSessionsPage;
