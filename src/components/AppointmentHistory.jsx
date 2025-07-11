import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";

const AppointmentHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/appointments/history");
        setHistory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch appointment history", err);
      }
    };

    fetchHistory();
  }, []);

  const isMentor = user?.data?.user?.role === "mentor";

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Appointment History
      </h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          No completed appointments yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {history.map((item) => {
            const person = isMentor ? item.user : item.mentor;

            return (
              <div
                key={item._id}
                className="bg-white w-64 p-5 rounded-2xl shadow-md hover:shadow-xl transition duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={person.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-20 h-20 rounded-full mb-3 object-cover"
                  />
                  <p className="font-semibold text-lg text-green-700">
                    {person.fullName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.skill}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Completed on:{" "}
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryPage;
