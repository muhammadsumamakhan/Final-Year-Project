import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../config/firebase/config';

const ExpertOrder = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null); // store current user
  const [orders, setOrders] = useState([]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch bookings for this expert
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "bookings"), where("expertId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
    });

    return () => unsubscribe();
  }, [user]);

  // Update booking status
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      alert(`Booking ${status}`);
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
      {orders.length === 0 && <p>No booking requests found.</p>}

      {orders.map((order) => (
        <div key={order.id} className="border p-4 rounded mb-4">
          <p><strong>User:</strong> {order.name} ({order.email})</p>
          <p><strong>Date & Time:</strong> {order.date} {order.time}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {order.status === "pending" ? (
            <>
              <button
                onClick={() => updateStatus(order.id, "accepted")}
                className="mr-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus(order.id, "rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </>
          ) : (
            <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpertOrder;


























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