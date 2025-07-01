import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api/axios";

const MentorProfile = () => {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await api.get(`/mentors/${mentorId}`);
        setMentor(res.data.data);
      } catch (err) {
        console.error("Failed to load mentor", err);
      }
    };

    fetchMentor();
  }, [mentorId]);

  if (!mentor) return <p className="text-center mt-20">Loading mentor profile...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <img
          src={mentor.avatar || "/default-avatar.png"}
          alt="Mentor"
          className="w-40 h-40 rounded-full object-cover border-4 border-green-500 mb-4"
        />
        <h2 className="text-3xl font-bold text-green-600 mb-2">{mentor.fullName}</h2>
        <p className="text-gray-700 mb-2">Email: {mentor.email}</p>
        <p className="text-gray-700 mb-2">Role: {mentor.role}</p>
        {mentor.bio && <p className="text-center text-gray-600 mt-4">{mentor.bio}</p>}
        {mentor.skills?.length > 0 && (
          <div className="mt-4 w-full">
            <h3 className="text-lg font-semibold mb-2">Skills:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {mentor.skills.map((skill, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm shadow">
                  {skill.name} — ₹{skill.price} — {skill.lectures} lectures
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorProfile;
