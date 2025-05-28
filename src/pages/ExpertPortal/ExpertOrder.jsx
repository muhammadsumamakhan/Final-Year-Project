// import React, { useState, useEffect } from "react";
// import { db, auth } from "../../config/firebase/config";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// const ExpertOrder = () => {
//   const [expertId, setExpertId] = useState(null);
//   const [bookings, setBookings] = useState([]);
//   const [userProfiles, setUserProfiles] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) setExpertId(user.uid);
//       else {
//         setExpertId(null);
//         setBookings([]);
//         setUserProfiles({});
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (!expertId) return;

//     const fetchExpertBookings = async () => {
//       setLoading(true);
//       try {
//         const bookingsQuery = query(
//           collection(db, "bookings"),
//           where("expertId", "==", expertId)
//         );
//         const snapshot = await getDocs(bookingsQuery);
//         const fetchedBookings = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setBookings(fetchedBookings);

//         const uniqueUserIds = [
//           ...new Set(fetchedBookings.map((b) => b.userId)),
//         ];

//         const userProfilePromises = uniqueUserIds.map(async (userId) => {
//           const userDoc = await getDocs(
//             query(collection(db, "FYPusers"), where("uid", "==", userId))
//           );
//           if (!userDoc.empty) {
//             return { userId, data: userDoc.docs[0].data() };
//           } else {
//             return { userId, data: null };
//           }
//         });

//         const profiles = await Promise.all(userProfilePromises);
//         const profilesObj = {};
//         profiles.forEach(({ userId, data }) => {
//           profilesObj[userId] = data;
//         });
//         setUserProfiles(profilesObj);
//       } catch (error) {
//         console.error("Error fetching expert bookings or profiles:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpertBookings();
//   }, [expertId]);

//   const updateBookingStatus = async (bookingId, status) => {
//     try {
//       const bookingRef = doc(db, "bookings", bookingId);
//       await updateDoc(bookingRef, { status });
//       setBookings((prev) =>
//         prev.map((booking) =>
//           booking.id === bookingId ? { ...booking, status } : booking
//         )
//       );
//     } catch (error) {
//       console.error("Error updating booking status:", error);
//     }
//   };

//   const deleteBooking = async (bookingId) => {
//     try {
//       const bookingRef = doc(db, "bookings", bookingId);
//       await deleteDoc(bookingRef);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
//     } catch (error) {
//       console.error("Error deleting booking:", error);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl sm:text-3xl bg-orange-500 text-white font-bold mb-6 border-b pb-7 pt-7 text-center">
//         My Bookings as Expert
//       </h1>

//       {loading && (
//         <p className="text-center text-gray-600 text-lg">Loading bookings...</p>
//       )}

//       {!loading && bookings.length === 0 && (
//         <p className="text-center italic text-gray-500 text-lg">
//           No bookings assigned to you yet.
//         </p>
//       )}

//       {!loading && bookings.length > 0 && (
//         <>
//           {/* Desktop Table */}
//           <div className="hidden sm:block overflow-x-auto">
//             <table className="min-w-full border-collapse text-sm sm:text-base">
//               <thead className="bg-[#0D003B] text-white sticky top-0">
//                 <tr>
//                   <th className="p-3 text-left">Profile</th>
//                   <th className="p-3 text-left">Date</th>
//                   <th className="p-3 text-left">Time</th>
//                   <th className="p-3 text-left">Address</th>
//                   <th className="p-3 text-left">Phone</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {bookings.map((booking) => {
//                   const user = userProfiles[booking.userId];
//                   return (
//                     <tr key={booking.id} className="border-b hover:bg-indigo-50 transition">
//                       <td className="p-3 flex items-center space-x-3">
//                         {user?.photoURL ? (
//                           <img
//                             src={user.photoURL}
//                             alt={user.name || "User"}
//                             className="w-10 h-10 rounded-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
//                             N/A
//                           </div>
//                         )}
//                         <div>
//                           <p className="font-semibold text-gray-900">
//                             {booking.name || user?.name || "No Name"}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="p-3 text-gray-700">{booking.date}</td>
//                       <td className="p-3 text-gray-700">{booking.time}</td>
//                       <td className="p-3 text-gray-700">{booking.address}</td>
//                       <td className="p-3 text-gray-700">{booking.phone}</td>
//                       <td className="p-3 text-center space-y-2 sm:space-x-2 sm:space-y-0 sm:flex sm:justify-center">
//                         <button
//                           onClick={() => updateBookingStatus(booking.id, "accepted")}
//                           disabled={booking.status === "accepted"}
//                           className={`w-full sm:w-auto px-4 py-1 rounded-md font-semibold transition ${
//                             booking.status === "accepted"
//                               ? "bg-green-300 cursor-not-allowed text-white"
//                               : "bg-green-600 hover:bg-green-700 text-white"
//                           }`}
//                         >
//                           Accept
//                         </button>
//                         <button
//                           onClick={() => deleteBooking(booking.id)}
//                           className="w-full sm:w-auto px-4 py-1 rounded-md font-semibold bg-red-600 hover:bg-red-700 text-white"
//                         >
//                           Reject
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Card View */}
//           <div className="sm:hidden space-y-4">
//             {bookings.map((booking) => {
//               const user = userProfiles[booking.userId];
//               return (
//                 <div key={booking.id} className="border rounded-lg p-4 shadow-sm">
//                   <div className="flex items-center space-x-3 mb-2">
//                     {user?.photoURL ? (
//                       <img
//                         src={user.photoURL}
//                         alt={user.name || "User"}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
//                         N/A
//                       </div>
//                     )}
//                     <div>
//                       <p className="font-semibold text-gray-900">
//                         {booking.name || user?.name || "No Name"}
//                       </p>
//                       <p className="text-xs text-gray-500">{booking.userId}</p>
//                     </div>
//                   </div>
//                   <p><span className="font-semibold">Date:</span> {booking.date}</p>
//                   <p><span className="font-semibold">Time:</span> {booking.time}</p>
//                   <p><span className="font-semibold">Address:</span> {booking.address}</p>
//                   <p><span className="font-semibold">Phone:</span> {booking.phone}</p>
//                   <div className="mt-3 flex flex-col gap-2">
//                     <button
//                       onClick={() => updateBookingStatus(booking.id, "accepted")}
//                       disabled={booking.status === "accepted"}
//                       className={`px-4 py-2 rounded-md font-semibold transition ${
//                         booking.status === "accepted"
//                           ? "bg-green-300 cursor-not-allowed text-white"
//                           : "bg-green-600 hover:bg-green-700 text-white"
//                       }`}
//                     >
//                       Accept
//                     </button>
//                     <button
//                       onClick={() => deleteBooking(booking.id)}
//                       className="px-4 py-2 rounded-md font-semibold bg-red-600 hover:bg-red-700 text-white"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ExpertOrder;





import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExpertOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [expertId, setExpertId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setExpertId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookings for this expert in real time
  useEffect(() => {
    if (!expertId) return;

    const bookingRef = collection(db, 'bookings');
    const q = query(bookingRef, where('expertId', '==', expertId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const bookingData = docSnap.data();
          const userRef = doc(db, 'FYPusers', bookingData.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          return {
            id: docSnap.id,
            ...bookingData,
            user: userData,
          };
        })
      );
      setBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [expertId]);

  // Accept booking
  const acceptBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'accepted' });
      toast.success('Booking accepted!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking.');
    }
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Expert Bookings</h1>

      {loading ? (
        <p className="text-gray-500">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-600 italic">No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="border p-4 mb-4 rounded shadow bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">User Info</h2>
            <p><strong>Name:</strong> {booking.user.fullName}</p>
            <p><strong>Email:</strong> {booking.user.email}</p>
            <p><strong>Phone:</strong> {booking.user.phone}</p>

            <div className="mt-4">
              <h3 className="font-semibold">Booking Details</h3>
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Status:</strong>{' '}
                <span
                  className={`font-bold ${
                    booking.status === 'accepted' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {booking.status}
                </span>
              </p>
            </div>

            {booking.status !== 'accepted' && (
              <button
                onClick={() => acceptBooking(booking.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept Booking
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ExpertOrders;
