import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../AuthContext';

const MyConnectionsPage = () => {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);

  const isMentor = user?.data?.user?.role === 'mentor';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = isMentor
          ? '/appointments/mentor/students'
          : '/appointments/student/mentors';
        const res = await api.get(endpoint);
        setConnections(res.data.data);
      } catch (err) {
        console.error('Error fetching connections:', err);
      }
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {isMentor ? 'My Students' : 'My Mentors'}
      </h2>

      {connections.length === 0 ? (
        <p className="text-center text-gray-500">No active connections.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {connections.map((conn) => {
            const person = isMentor ? conn.user : conn.mentor;
            return (
              <div
                key={conn._id}
                className="bg-white shadow-md p-4 rounded-xl flex flex-col items-center text-center"
              >
                <img
                  src={person.avatar || '/default-avatar.png'}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
                <p className="font-semibold">{person.fullName}</p>
                <p className="text-sm text-gray-600">{conn.skill}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyConnectionsPage;
