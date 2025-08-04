import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";

const SessionHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const userRole = user?.role; // ✅ fixed
        setRole(userRole);

        const res = await api.get(
          userRole === "mentor" ? "/sessions/mentor" : "/sessions/user"
        );

        const now = new Date();

        const history = res.data.data.filter((session) => {
          const sessionDate = new Date(session.date);
          const [hours, minutes] = session.time.split(":").map(Number);
          sessionDate.setHours(hours, minutes, 0, 0);
          return session.isCompleted || sessionDate < now;
        });

        setSessions(history);
      } catch (err) {
        console.error("Failed to fetch session history", err);
      }
    };

    if (user) fetchSessions();
  }, [user]);

  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(":").map(Number);
    date.setHours(hours, minutes);

    const formattedDate = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Session History</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">No past sessions found.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const person = role === "mentor" ? session.user : session.mentor;

            return (
              <div
                key={session._id}
                className="bg-white shadow-md p-4 rounded-xl border"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={person?.avatar || "/default-avatar.png"}
                      className="w-14 h-14 rounded-full object-cover"
                      alt="avatar"
                    />
                    <div>
                      <p className="font-semibold">{person?.fullName}</p>
                      <p className="text-sm text-gray-600">{session.skill}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm">
                  <strong>📅 Date:</strong> {formatDateTime(session.date, session.time)}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  <strong>Status:</strong>{" "}
                  {session.isCompleted ? "Completed" : "Past"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionHistoryPage;
