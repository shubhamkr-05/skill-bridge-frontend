import React,{useContext} from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const MentorSkillCard = ({ mentorId, skill, fee, lectures, description}) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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
      const { orderRes } = await api.post('/payments/create-order', {
        amount: fee,
        mentorId,
        skill,
      });

      console.log('orderRes', orderRes)

      const { orderId, amount, key } = orderRes.data.data; // ✅ fix here

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
            navigate("/appointments");
          }
        },
        prefill: {
          name: user?.data?.user?.fullName,
          email: user?.data?.user?.email,
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
      
      {user?.data.user.role === 'user' && (
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
