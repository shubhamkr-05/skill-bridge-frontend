import React from 'react';
import { useNavigate } from 'react-router-dom';

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/mentors/${mentor._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
    >
      <img
        src={mentor.avatar || "/default-avatar.png"}
        alt={mentor.fullName}
        className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
      />
      <h3 className="text-center font-bold text-lg">{mentor.fullName}</h3>
      <p className="text-center text-gray-600 text-sm mb-2">{mentor.bio}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {mentor.skills.map((skill, idx) => (
          <span
            key={idx}
            className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MentorCard;
