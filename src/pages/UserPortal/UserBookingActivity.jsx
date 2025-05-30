import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from '../../config/firebase/config';

const UserBookingActivity = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState({});

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingList);

      const expertIds = [...new Set(bookingList.map(b => b.expertId))];
      const expertMap = {};

      await Promise.all(
        expertIds.map(async (expertId) => {
          if (!expertId) return;
          try {
            const q = query(collection(db, "FYPusers"), where("uid", "==", expertId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              expertMap[expertId] = querySnapshot.docs[0].data();
            } else {
              console.warn("Expert not found for ID:", expertId);
            }
          } catch (error) {
            console.error("Error fetching expert:", error);
          }
        })
      );

      setExperts(expertMap);
    });

    return () => unsubscribe();
  }, [user]);

  const cancelBooking = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        status: "cancelled"
      });
      alert("Booking cancelled.");
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
  <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow-md">
    <h1 className="text-white text-3xl font-bold tracking-wide">My Bookings</h1>
  </header>

  <main className="max-w-4xl mx-auto mt-8">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Bookings</h2>

    {bookings.length === 0 ? (
      <p className="text-center text-gray-500 mt-12 text-lg">No bookings found.</p>
    ) : (
      bookings.map((booking) => {
        const expert = experts[booking.expertId];

        return (
          <div
            key={booking.id}
            className="bg-white shadow-lg rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6"
          >
            {/* Expert Profile */}
            {booking.expertId && expert ? (
              <div className="flex-shrink-0">
                <img
                  src={expert.profileUrl || '/default-profile.png'}
                  alt={`${expert.fullName} profile`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
                />
              </div>
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-full text-gray-400 font-medium">
                N/A
              </div>
            )}

            {/* Booking & Expert Details */}
            <div className="flex-grow space-y-2">
              {booking.expertId ? (
                expert ? (
                  <>
                    <p className="text-xl font-semibold text-gray-900">{expert.fullName}</p>
                    <p className="text-gray-600">{expert.email}</p>
                    {expert.phone && <p className="text-gray-600">📞 {expert.phone}</p>}
                    {expert.specialization && (
                      <p className="text-sm text-orange-600 font-medium">{expert.specialization}</p>
                    )}
                  </>
                ) : (
                  <p className="italic text-gray-500">Loading expert info...</p>
                )
              ) : (
                <p className="italic text-red-500">Expert ID not found in booking</p>
              )}

              <hr className="my-3" />

              <p>
                <span className="font-semibold">Service Date:</span> {booking.date} at {booking.time}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`font-semibold ${
                    booking.status === 'pending'
                      ? 'text-yellow-500'
                      : booking.status === 'accepted'
                      ? 'text-green-600'
                      : booking.status === 'rejected'
                      ? 'text-gray-600'
                      : booking.status === 'cancelled'
                      ? 'text-red-500'
                      : 'text-gray-700'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3">
              {booking.status === 'pending' && (
                <>
                  <button
                    className="px-11 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded cursor-not-allowed"
                    disabled
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Cancel Booking
                  </button>
                </>
              )}

              {booking.status === 'accepted' && (
                <button className="px-5 py-2 bg-green-600 text-white rounded cursor-default" disabled>
                  Accepted
                </button>
              )}

              {booking.status === 'rejected' && (
                <button className="px-5 py-2 bg-gray-600 text-white rounded cursor-default" disabled>
                  Rejected
                </button>
              )}

              {booking.status === 'cancelled' && (
                <button className="px-5 py-2 bg-red-400 text-white rounded cursor-default" disabled>
                  Cancelled
                </button>
              )}
            </div>
          </div>
        );
      })
    )}
  </main>
</div>

  )
};

export default UserBookingActivity;





















// import React, { useEffect, useState } from 'react';
// import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from '../../config/firebase/config';

// const UserBookingActivity = () => {
//   const auth = getAuth();
//   const user = auth.currentUser;

//   const [bookings, setBookings] = useState([]);

//   useEffect(() => {
//     if (!user) return;

//     // Query bookings for current user
//     const q = query(collection(db, "bookings"), where("userId", "==", user.uid));

//     // Listen to real-time updates
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const bookingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setBookings(bookingList);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   const cancelBooking = async (id) => {
//     try {
//       // Update status to cancelled or delete booking if preferred
//       await updateDoc(doc(db, "bookings", id), {
//         status: "cancelled"
//       });
//       alert("Booking cancelled.");
//     } catch (error) {
//       console.error("Cancel error:", error);
//     }
//   };

//   return (
//     <div className="p-6">
//       <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow">
//         <h1 className="text-white text-2xl md:text-3xl font-bold">My booking</h1>
//       </header>
//       <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
//       {bookings.length === 0 && <p>No bookings found.</p>}

//       {bookings.map((booking) => (
//         <div key={booking.id} className="border p-4 rounded mb-4">
//           <p><strong>Service Date:</strong> {booking.date} {booking.time}</p>
//           <p><strong>Status:</strong> {booking.status}</p>

//           {booking.status === "pending" && (
//             <>
//               <button className="mr-4 px-4 py-2 bg-yellow-400 rounded cursor-not-allowed" disabled>Pending</button>
//               <button
//                 onClick={() => cancelBooking(booking.id)}
//                 className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//               >
//                 Cancel Booking
//               </button>
//             </>
//           )}

//           {booking.status === "accepted" && (
//             <button className="px-4 py-2 bg-green-600 text-white rounded" disabled>Accepted</button>
//           )}

//           {booking.status === "rejected" && (
//             <button className="px-4 py-2 bg-gray-600 text-white rounded" disabled>Rejected</button>
//           )}

//           {booking.status === "cancelled" && (
//             <button className="px-4 py-2 bg-red-400 text-white rounded" disabled>Cancelled</button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UserBookingActivity;




















