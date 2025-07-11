import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  const isMentor = user?.data?.user?.role === 'mentor';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/appointments');
        setAppointments(data.data);
      } catch (err) {
        console.error('Error loading appointments', err);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      case 'booked':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-24 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Appointment History</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white border shadow rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p>
                  {isMentor ? (
                    <>
                      <span className="font-medium">Student:</span>{' '}
                      <span>{appt.user.fullName}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Mentor:</span>{' '}
                      <span>{appt.mentor.fullName}</span>
                    </>
                  )}
                </p>
                <p>
                  <span className="font-medium">Skill:</span> {appt.skill}
                </p>
                <p>
                  <span className="font-medium">Fee:</span> ₹{appt.fee}
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                    appt.status
                  )}`}
                >
                  {appt.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(appt.createdAt).toLocaleDateString()}
                </span>

                <Link
                  to={isMentor ? "/my-students" : "/my-courses"}
                  className="mt-2 text-sm text-green-600 hover:underline"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
