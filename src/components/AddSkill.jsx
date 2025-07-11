import React, { useState } from 'react';
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';

const AddSkill = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [lectures, setLectures] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/mentors/add-skill", { name, price, lectures, bio });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add skill");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add a New Skill</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Skill Name"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Number of Lectures"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={lectures}
          onChange={(e) => setLectures(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Skill Description"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Add Skill
        </button>
      </form>
    </div>
  );
};

export default AddSkill;
