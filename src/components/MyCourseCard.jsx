import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/appointments/my-courses');
        setCourses(data.data);
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>

      {courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg">You have not enrolled in any courses yet.</p>
          <p className="text-sm">Explore mentors and buy a course to get started!</p>
        </div>
      ) : (
        courses.map(course => (
          <div key={course._id} className="border p-3 rounded shadow mb-3 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <img
                src={course.mentor.avatar || '/default-avatar.png'}
                alt="mentor avatar"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-lg font-semibold text-green-700">{course.mentor.fullName}</p>
                <p className="text-sm text-gray-600">{course.skill}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyCoursesPage;
