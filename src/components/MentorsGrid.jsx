import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import MentorCard from './MentorCard';

const MentorsGrid = ({ searchQuery }) => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Prepare query params
        const params = {};
        if (searchQuery) {
          params.skill = searchQuery;
        }

        // Fetch mentors
        const { data } = await api.get('/mentors', { params });
        setMentors(data.data);
      } catch (err) {
        console.error('Failed to fetch mentors', err);
      }
    };

    fetchMentors();
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {mentors.length > 0 ? (
        mentors.map((mentor) => (
          <MentorCard key={mentor._id} mentor={mentor} />
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">No mentors found.</p>
      )}
    </div>
  );
};

export default MentorsGrid;
