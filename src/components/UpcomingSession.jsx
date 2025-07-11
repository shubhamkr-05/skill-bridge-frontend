import React, { useEffect, useState } from "react";
import api from "../api/axios";

const UpcomingSessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      const res = await api.get("/sessions/my-upcoming-sessions");
      setSessions(res.data.data);
    } catch (err) {
      console.error("Error fetching upcoming sessions", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          You don't have any upcoming sessions yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white w-72 p-5 rounded-2xl shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={session.mentor.avatar || "/default-avatar.png"}
                  alt="mentor avatar"
                  className="w-20 h-20 rounded-full mb-3 object-cover"
                />
                <p className="font-semibold text-lg text-green-700">
                  {session.mentor.fullName}
                </p>
                <p className="text-sm text-gray-600">{session.skill}</p>

                {session.sessionDate && session.sessionTime ? (
                  <>
                    <p className="mt-2 text-sm">
                      Scheduled for: {session.sessionDate} @{" "}
                      {session.sessionTime}
                    </p>
                    <p className="text-green-600 text-sm font-semibold">
                      Status: Scheduled
                    </p>
                  </>
                ) : (
                  <p className="text-yellow-600 text-sm font-semibold mt-2">
                    Status: Waiting to be scheduled
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsPage;
