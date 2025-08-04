import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('bio', bio);

    try {
      const response = await api.patch('/users/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ✅ updated user state
      login(response.data.data);
      navigate('/');
    } catch (err) {
      setError('Something went wrong while updating your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-600">Update Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-gray-700">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          rows="3"
        />

        <button
          type="submit"
          className={`w-full bg-green-500 text-white py-2 rounded ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
