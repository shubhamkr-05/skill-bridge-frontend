import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const MyStudentsPage = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/appointments/my-students');
        setStudents(data.data);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <h2 className="text-2xl font-bold mb-4">My Students</h2>

      {students.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg">No students yet.</p>
          <p className="text-sm">Accept a course to see your students here!</p>
        </div>
      ) : (
        students.map(student => (
          <div key={student._id} className="border p-3 rounded shadow mb-3 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <img
                src={student.user.avatar || '/default-avatar.png'}
                alt="student avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{student.user.fullName}</p>
                <p className="text-sm text-gray-600">{student.skill}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyStudentsPage;
