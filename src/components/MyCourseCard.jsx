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
    <div className="max-w-6xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Courses</h2>

      {courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg">You have not enrolled in any courses yet.</p>
          <p className="text-sm">Explore mentors and buy a course to get started!</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {courses.map(course => (
            <div
              key={course._id}
              className="bg-white w-72 p-5 rounded-2xl shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={course.mentor.avatar || '/default-avatar.png'}
                  alt="mentor avatar"
                  className="w-20 h-20 rounded-full mb-3 object-cover"
                />
                <p className="font-semibold text-lg text-green-700">{course.mentor.fullName}</p>
                <p className="text-sm text-gray-600 mt-1 mb-2">{course.skill}</p>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
