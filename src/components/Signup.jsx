import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from "../api/axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [role, setRole] = useState("user");
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSkillInput = (e) => {
    const value = e.target.value;
    const skillArray = value.split(',').map(s => s.trim()).filter(s => s);
    setSkills(skillArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    };

    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('fullName', fullName);
    formData.append('avatar', avatar);
    formData.append('role', role);
    formData.append('bio', bio);
    formData.append("skills", skills.join(","));

    try {
      const response = await api.post(
        'users/register', formData, config
      );

      const response2 = await api.post('users/login', { email, password, username });
      login(response2.data);
      navigate('/');

    } catch (error) {
      console.log(error);
      setError('Sorry, there was an error while signing you up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-100% items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md ">
        <h2 className="text-2xl font-bold mb-6">Signup</h2>

        {error && (
          <div className="mb-4 text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="user">User</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          {role === "mentor" && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Skills (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. JavaScript, React, Node.js"
                onChange={handleSkillInput}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows="3"
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-green-500 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414-1.415C7.021 14.345 6 13.218 6 12H2c0 1.934.784 3.682 2.05 5.05l1.414-1.415z"
                  ></path>
                </svg>
                Signing up...
              </div>
            ) : (
              "Signup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
