import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import MentorSkillCard from './MentorSkillCard';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">You must be logged in to view this page.</p>
      </div>
    );
  }

  const { fullName, username, email, role, bio, avatar, skills } = user.data.user;

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <img
          src={avatar || "/default-avatar.png"}
          alt="Profile"
          className="w-40 h-40 rounded-full object-cover border-4 border-green-500 mb-4"
        />
        <h2 className="text-3xl font-bold text-green-600 mb-2">{fullName}</h2>
        <p className="text-gray-700 mb-1">Username: {username}</p>
        <p className="text-gray-700 mb-1">Email: {email}</p>
        <p className="text-gray-700 mb-1">Role: {role}</p>
        {bio && <p className="text-center text-gray-600 mt-4">{bio}</p>}
      </div>

      {role === "mentor" && skills?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {skills.map((skill, idx) => (
            <MentorSkillCard
              key={idx}
              mentorId={user.data.user._id}
              skill={skill.name}
              fee={skill.price}
              lectures={skill.lectures}
              isOwnProfile={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
