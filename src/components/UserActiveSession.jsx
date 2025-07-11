import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const UserActiveSessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get('/sessions/user');
        const active = data.data.filter(s => !s.isCompleted);
        setSessions(active);
      } catch (err) {
        console.error('Failed to load active sessions', err);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Upcoming Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">You don't have any upcoming sessions.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white shadow p-4 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={session.mentor.avatar || "/default-avatar.png"}
                  alt="mentor avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{session.mentor.fullName}</p>
                  <p className="text-sm text-gray-600">{session.date} at {session.time}</p>
                </div>
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

export default UserActiveSessionsPage;
