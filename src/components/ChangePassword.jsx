import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      await api.post('/users/change-password', { oldPassword, newPassword });
      setSuccessMsg('Password changed successfully');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Check your old password or try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      {successMsg && <p className="mb-4 text-green-600">{successMsg}</p>}
      <form onSubmit={handleChange}>
        <label className="block mb-2">Old Password</label>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" />

        <label className="block mb-2">New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
