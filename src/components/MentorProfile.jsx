import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api/axios";
import MentorSkillCard from './MentorSkillCard';
import { AuthContext } from '../AuthContext';

const MentorProfile = () => {
  const { mentorId } = useParams();
  const { user } = useContext(AuthContext);
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const { data } = await api.get(`/mentors/${mentorId}`);
        setMentor(data.data);
      } catch (err) {
        console.error("Failed to load mentor profile", err);
      }
    };
    fetchMentor();
  }, [mentorId]);

  if (!mentor) return <p className="text-center mt-20">Loading...</p>;

  // Check if logged-in user is viewing own profile
  const isOwnProfile = user?.data?.user?._id === mentor._id;

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <img
          src={mentor.avatar || "/default-avatar.png"}
          alt="Mentor"
          className="w-40 h-40 rounded-full object-cover border-4 border-green-500 mb-4"
        />
        <h2 className="text-3xl font-bold text-green-600 mb-2">{mentor.fullName}</h2>
        <p className="text-gray-700 mb-1">Email: {mentor.email}</p>
        {mentor.bio && <p className="text-center text-gray-600 mt-4">{mentor.bio}</p>}
      </div>

      {mentor.skills?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {mentor.skills.map((skill, idx) => (
            <MentorSkillCard
              key={idx}
              mentorId={mentor._id}
              skill={skill.name}
              fee={skill.price}
              lectures={skill.lectures}
              isOwnProfile={isOwnProfile}
              description={skill.bio}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
