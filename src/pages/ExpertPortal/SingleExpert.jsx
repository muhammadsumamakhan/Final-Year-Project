import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase/config';
import { getAuth } from 'firebase/auth';

const SingleExpert = () => {
  const { id } = useParams(); // expert ID
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const docRef = doc(db, "FYPusers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExpert(docSnap.data());
        } else {
          console.error("Expert not found");
        }
      } catch (error) {
        console.error("Error fetching expert details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpert();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBooking = async () => {
    const { name, email, phone, address, date, time } = formData;
    if (!name || !email || !phone || !address || !date || !time) {
      toast.error("Please fill out all fields.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to book.");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        name,
        email,
        phone,
        address,
        date,
        time,
        userId: user.uid,
        expertId: expert.uid, 
        status: "pending",
        createdAt: serverTimestamp()
      });

      toast.success(`Booking confirmed with ${expert.fullName}`);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', address: '', date: '', time: '' });
      setTimeout(() => {
      navigate('/user-booking-activity');
    }, 2000);
    
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book service. Try again.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading expert details...</p>;
  if (!expert) return <p className="text-center text-red-600 mt-10">Expert not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-32">
        <button
          onClick={() => navigate('/allexpert')}
          className="flex items-center text-white text-lg sm:text-xl md:text-2xl font-bold transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Expert List
        </button>
      </header>

      {/* Expert Details */}
      <div className="flex flex-col items-center bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 rounded-lg shadow-md w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-full mt-12 mx-auto mb-14">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
          <img
            src={expert.profileUrl || "/default-profile.png"}
            alt={`Profile of ${expert.fullName}`}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{expert.fullName}</h2>
            <p className="text-gray-700">{expert.specialization}</p>
            <div className="mt-6 space-y-2 text-gray-600">
              <p><strong>Uid:</strong> {expert.uid}</p>
              <p><strong>Email:</strong> {expert.email}</p>
              <p><strong>Phone:</strong> {expert.phone}</p>
              <p><strong>City:</strong> {expert.city}</p>
              <p><strong>Service Area:</strong> {expert.serviceArea}</p>
              <p><strong>Experience Level:</strong> {expert.experience}</p>
              <p><strong>Skills:</strong> {expert.skills}</p>
              <p><strong>Charges:</strong> Rs. {expert.charges}</p>
              <p><strong>GitHub:</strong>
                {expert.github ? (
                  <a href={`https://github.com/${expert.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                    {expert.github}
                  </a>
                ) : " Not Available"}
              </p>
              <p><strong>LinkedIn:</strong>
                {expert.linkedIn ? (
                  <a href={`https://linkedin.com/in/${expert.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                    {expert.linkedIn}
                  </a>
                ) : " Not Available"}
              </p>
              <p><strong>National ID:</strong> {expert.nationalId}</p>
              <p><strong>National ID Image:</strong>
                <a href={expert.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                  View
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Book Now Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 px-8 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 transition-all"
        >
          Book Now
        </button>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Book a Service</h2>
            <p className="text-center mb-4 text-gray-700">Fill the form below to book with <strong>{expert.fullName}</strong>.</p>

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone Number" className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Your Address" className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full mb-3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full mb-5 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" />

            <button
              onClick={handleBooking}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleExpert;
