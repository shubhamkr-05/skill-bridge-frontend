import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SessionManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [videoCallLink, setVideoCallLink] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/sessions/mentor/active-students");
      setStudents(res.data.data);
    } catch (err) {
      console.error("Error loading students", err);
    }
  };

  const openScheduleForm = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    setDate("");
    setTime("");
    setVideoCallLink("");
    setShowModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!date || !time || !videoCallLink) {
      return alert("All fields are required");
    }

    try {
      const res = await api.post("/sessions", {
        appointmentId: selectedAppointment,
        date,
        time,
        videoCallLink,
      });
      alert("Session scheduled successfully!");
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Failed to schedule session", err.response?.data || err);
      alert("Failed to schedule session. Check console for details.");
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
          {students.map((student) => (
            <div
              key={student.appointmentId}
              className="bg-white w-72 p-5 rounded-2xl shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={student.user.avatar || "/default-avatar.png"}
                  alt="student avatar"
                  className="w-20 h-20 rounded-full mb-3 object-cover"
                />
                <p className="font-semibold text-lg">
                  {student.user.fullName}
                </p>
                <p className="text-sm text-gray-500">{student.skill}</p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => openScheduleForm(student.appointmentId)}
                  className="bg-blue-500 text-white py-1 rounded w-full hover:bg-blue-600"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Schedule Session
            </h3>

            <label className="block mb-2 text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <label className="block mb-2 text-sm font-medium">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <label className="block mb-2 text-sm font-medium">
              Video Call Link
            </label>
            <input
              type="text"
              placeholder="https://meet.example.com/class"
              value={videoCallLink}
              onChange={(e) => setVideoCallLink(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagementPage;
