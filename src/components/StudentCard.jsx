import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudentsPage;
