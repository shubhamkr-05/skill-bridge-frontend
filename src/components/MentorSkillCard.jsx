import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const MentorSkillCard = ({ mentorId, skill, fee, lectures, description }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user?.role !== 'user') return;

      try {
        const { data } = await api.get('/appointments');
        const appointments = data.data;

        const exists = appointments.some(
          (appt) =>
            appt.mentor._id === mentorId &&
            appt.skill.toLowerCase() === skill.toLowerCase()
        );

        setAlreadyEnrolled(exists);
      } catch (err) {
        console.error('Failed to check enrollment', err);
      }
    };

    checkEnrollment();
  }, [mentorId, skill, user]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async () => {
    const res = await loadRazorpay();

    if (!res) return alert("Razorpay SDK failed to load. Are you online?");

    try {
      const orderRes = await api.post('/payments/create-order', {
        amount: fee,
        mentorId,
        skill,
      });

      const { orderId, amount, key } = orderRes.data.data;

      const options = {
        key,
        amount,
        currency: "INR",
        name: "Skill Booking",
        description: `Buying ${skill} from Mentor`,
        order_id: orderId,
        handler: async function (response) {
          const verifyRes = await api.post("/payments/verify-payment", {
            ...response,
            mentorId,
            skill,
            fee,
          });
          if (verifyRes.data.success) {
            navigate("/");
            alert("Payment successful! Your appointment is confirmed.");
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
        },
        theme: {
          color: "#38a169",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Something went wrong in payment");
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

      {user?.role === 'user' && (
        alreadyEnrolled ? (
          <p className="text-sm text-green-600 text-center font-medium mt-2">
            ✅ You are already enrolled
          </p>
        ) : (
          <button
            onClick={handleBuyNow}
            className="bg-green-500 text-white py-1 rounded w-full"
          >
            Buy Now
          </button>
        )
      )}
    </div>
  );
};

export default MentorSkillCard;
