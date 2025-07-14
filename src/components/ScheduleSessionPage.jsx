import React, { useEffect, useState } from "react";
import api from "../api/axios";

const ScheduleSessionPage = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/appointments/mentor/students");
        setStudents(res.data.data);
      } catch (err) {
        console.error("Error loading students", err);
      }
    };

    fetchStudents();
  }, []);

  const handleInputChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSchedule = async (appointmentId) => {
    const { date, time, videoCallLink } = formData[appointmentId] || {};
    if (!date || !time || !videoCallLink) {
      return alert("All fields are required");
    }

    try {
      await api.post("/sessions", {
        appointmentId,
        date,
        time,
        videoCallLink,
      });
      alert("Session scheduled!");
      setFormData((prev) => ({ ...prev, [appointmentId]: {} }));
    } catch (err) {
      console.error("Failed to schedule session", err);
      alert("Failed to schedule session");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Schedule Sessions</h2>

      {students.length === 0 ? (
        <p className="text-center text-gray-500">No active students found.</p>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <div
              key = {student._id}
              className="bg-white p-4 rounded-xl shadow border"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={student.user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{student.user.fullName}</p>
                  <p className="text-sm text-gray-600">{student.skill}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  type="date"
                  className="border rounded p-2"
                  onChange={(e) =>
                    handleInputChange(student._id, "date", e.target.value)
                  }
                  value={formData[student._id]?.date || ""}
                />
                <input
                  type="time"
                  className="border rounded p-2"
                  onChange={(e) =>
                    handleInputChange(student._id, "time", e.target.value)
                  }
                  value={formData[student._id]?.time || ""}
                />
                <input
                  type="text"
                  placeholder="Video Call Link"
                  className="border rounded p-2"
                  onChange={(e) =>
                    handleInputChange(student._id, "videoCallLink", e.target.value)
                  }
                  value={formData[student._id]?.videoCallLink || ""}
                />
                <button
                  className="bg-green-600 text-white rounded px-3 py-2"
                  onClick={() => handleSchedule(student._id)}
                >
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleSessionPage;
