import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SessionManagementPage = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/sessions/my-sessions");
      setStudents(res.data.data);
    } catch (err) {
      console.error("Error loading students", err);
    }
  };

  const handleSchedule = async (sessionId) => {
    const date = prompt("Enter session date (YYYY-MM-DD):");
    const time = prompt("Enter session time (HH:mm):");

    if (!date || !time) return alert("Both date and time are required");

    try {
      await api.post(`/sessions/schedule/${sessionId}`, {
        date,
        time,
      });
      alert("Session scheduled successfully!");
      fetchStudents();
    } catch (err) {
      console.error("Failed to schedule session", err);
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      await api.patch(`/sessions/complete/${sessionId}`);
      alert("Session marked as completed");
      fetchStudents();
    } catch (err) {
      console.error("Failed to mark session as completed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Sessions</h2>

      {students.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No active students or sessions found.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {students.map((session) => (
            <div
              key={session._id}
              className="bg-white w-72 p-5 rounded-2xl shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={session.user.avatar || "/default-avatar.png"}
                  alt="student avatar"
                  className="w-20 h-20 rounded-full mb-3 object-cover"
                />
                <p className="font-semibold text-lg">
                  {session.user.fullName}
                </p>
                <p className="text-sm text-gray-500">{session.skill}</p>
                {session.sessionDate && session.sessionTime ? (
                  <>
                    <p className="mt-2 text-sm">
                      Scheduled: {session.sessionDate} @ {session.sessionTime}
                    </p>
                    <p className="text-green-600 text-sm font-semibold">
                      Status: Scheduled
                    </p>
                  </>
                ) : (
                  <p className="text-red-600 text-sm font-semibold mt-2">
                    Not scheduled
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {!session.sessionDate && (
                  <button
                    onClick={() => handleSchedule(session._id)}
                    className="bg-blue-500 text-white py-1 rounded"
                  >
                    Schedule Session
                  </button>
                )}
                <button
                  onClick={() => handleComplete(session._id)}
                  className="bg-green-600 text-white py-1 rounded"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionManagementPage;
