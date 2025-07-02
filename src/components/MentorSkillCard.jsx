import React from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const MentorSkillCard = ({ mentorId, skill, fee, lectures, description, isOwnProfile }) => {
  const navigate = useNavigate();

  const handleBuyNow = async () => {
    try {
      const res = await api.post('/appointments', {
        mentorId: mentorId,
        skill: skill,
        fee: fee
      });

      // Optionally show success feedback or navigate
      navigate('/appointments');
    } catch (err) {
      console.error("Failed to create appointment", err);
      alert(err.response?.data?.message || "Failed to create appointment");
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition w-64">
      <h4 className="text-lg font-semibold text-green-700 mb-2">{skill}</h4>
      
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      
      <p className="text-sm mb-1">Price: ₹{fee}</p>
      <p className="text-sm mb-3">Lectures: {lectures}</p>
      
      {!isOwnProfile && (
        <button
          onClick={handleBuyNow}
          className="bg-green-500 text-white py-1 rounded w-full"
        >
          Buy Now
        </button>
      )}
    </div>
  );
};

export default MentorSkillCard;
