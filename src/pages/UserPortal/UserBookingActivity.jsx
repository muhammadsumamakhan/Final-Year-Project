import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserBookingActivity = () => {
  const [userId, setUserId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get current user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('Current User ID:', user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch booking and expert
  useEffect(() => {
    if (!userId) return;

    const fetchBookingAndExpert = async () => {
      try {
        const bookingQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', userId)
        );
        const bookingSnapshot = await getDocs(bookingQuery);

        if (bookingSnapshot.empty) {
          console.warn('No bookings found for this user.');
          return;
        }

        const bookingDoc = bookingSnapshot.docs[0];
        setBooking(bookingDoc.data());
        setBookingId(bookingDoc.id);

        const expertRef = doc(db, 'FYPusers', bookingDoc.data().expertId);
        const expertSnap = await getDoc(expertRef);

        if (expertSnap.exists()) {
          setExpert(expertSnap.data());
        } else {
          const fallbackQuery = query(
            collection(db, 'FYPusers'),
            where('uid', '==', bookingDoc.data().expertId),
            where('role', '==', 'expert')
          );
          const fallbackSnap = await getDocs(fallbackQuery);

          if (!fallbackSnap.empty) {
            setExpert(fallbackSnap.docs[0].data());
          } else {
            console.warn('Expert not found.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBookingAndExpert();
  }, [userId]);

  // Cancel booking
  const cancelBooking = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBooking(null);
      setExpert(null); // Clear expert as well
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Error cancelling booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow">
        <h1 className="text-white text-2xl md:text-3xl font-bold">My Booking Activity</h1>
      </header>

      <div className="px-4 py-6 max-w-screen-lg mx-auto sm:px-6 lg:px-[166px]">
        {/* Expert Profile and Booking Info */}
        {booking && expert && (
          <div className="border p-4 rounded shadow flex flex-col md:flex-row items-center md:items-start gap-6">
            {expert.profileUrl && (
              <img
                src={expert.profileUrl}
                alt="Expert Profile"
                className="w-32 h-32 md:w-48 md:h-48 object-cover border-4 shadow"
              />
            )}

            <div className="flex-1 w-full">
              <p><strong>Name:</strong> {expert.fullName}</p>
              <p><strong>Specialization:</strong> {expert.specialization}</p>
              <p><strong>Experience Level:</strong> {expert.experience}</p>
              <p><strong>Phone:</strong> {expert.phone}</p>
              <p><strong>Charges:</strong> {expert.charges}</p>
              <p className="border-t-2 mt-3 mb-3"></p>

              <div>
                <h3 className="text-lg font-bold mb-2">Booking Details</h3>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Time:</strong> {booking.time}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 md:mt-0 flex flex-col gap-2 items-center text-center w-full md:w-auto">
              <button className="bg-blue-500 text-white p-2 rounded w-full md:w-40">Pay Online</button>
              <button className="bg-yellow-500 text-white p-2 rounded w-full md:w-40">Pending</button>
              <button
                onClick={cancelBooking}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded w-full md:w-40"
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        )}

        {/* No booking message */}
        {!booking && userId && !loading && (
          <div className="text-gray-600 italic mt-12 mb-12 text-center text-lg">
            {/* No booking found for this user. */}
            You haven't made any bookings yet.
          </div>
        )}

        {/* Loading message */}
        {loading && (
          <div className="text-gray-600 italic mt-6 text-center text-lg">
            Cancelling booking...
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingActivity;
