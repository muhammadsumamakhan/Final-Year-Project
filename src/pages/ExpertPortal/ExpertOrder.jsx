import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../config/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExpertOrder = () => {
  const [expertId, setExpertId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to get expert's uid
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setExpertId(user.uid);
      } else {
        setExpertId(null);
        setBookings([]); // Clear bookings on sign out
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!expertId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);

        // Query bookings where expertId == current expert uid, order by createdAt descending
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('expertId', '==', expertId),
          orderBy('createdAt') 
        );

        const bookingSnapshot = await getDocs(bookingsQuery);

        if (bookingSnapshot.empty) {
          setBookings([]);
          return;
        }

        // Fetch user data for each booking
        const bookingsData = await Promise.all(
          bookingSnapshot.docs.map(async (docSnap) => {
            const booking = docSnap.data();
            const userRef = doc(db, 'FYPusers', booking.userId);
            const userSnap = await getDoc(userRef);

            return userSnap.exists()
              ? {
                  id: docSnap.id,
                  ...booking,
                  user: userSnap.data(),
                }
              : {
                  id: docSnap.id,
                  ...booking,
                  user: { name: 'User not found' },
                };
          })
        );

        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [expertId]);

  const updateBookingStatus = useCallback(
    async (bookingId, status) => {
      if (!window.confirm(`Are you sure you want to mark this booking as "${status}"?`)) {
        return;
      }

      try {
        setLoading(true);
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: status,
        });

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking
          )
        );

        toast.success(`Booking marked as ${status}`);
      } catch (error) {
        console.error('Error updating booking:', error);
        toast.error('Failed to update booking');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div>
      <ToastContainer />
      <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow">
        <h1 className="text-white text-2xl md:text-3xl font-bold">My Orders</h1>
      </header>

      <div className="px-4 py-6 max-w-screen-lg mx-auto sm:px-6 lg:px-[166px]">
        {loading && bookings.length === 0 ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-600 italic mt-12 mb-12 text-center text-lg">
            You don't have any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      Booking #{booking.id.slice(0, 8)}
                    </h3>
                    <p>
                      <strong>Client:</strong> {booking.user?.name || booking.user?.fullName || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong> {booking.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {booking.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {booking.address}
                    </p>
                    <p>
                      <strong>Date:</strong> {booking.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.time}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`ml-2 px-2 py-1 rounded text-sm ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status || 'pending'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'accepted')}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                      disabled={loading || booking.status === 'accepted' || booking.status === 'completed'}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      disabled={loading || booking.status === 'rejected' || booking.status === 'completed'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                      disabled={loading || booking.status === 'completed' || booking.status === 'rejected'}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertOrder;
