import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from '../../config/firebase/config';
import { useNavigate } from 'react-router-dom';

const APP_ID = 297250868;
const SERVER_SECRET = 'b629a7c9f6478129ba54a3ffb5623740';

const UserBookingActivity = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
    return onSnapshot(q, async snap => {
      const bs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(bs);
      const ids = [...new Set(bs.map(b => b.expertId))];
      const exMap = {};
      await Promise.all(ids.map(async eid => {
        const q2 = query(collection(db, "FYPusers"), where("uid", "==", eid));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) exMap[eid] = snap2.docs[0].data();
      }));
      setExperts(exMap);
    });
  }, [user]);

  const cancelBooking = async id => {
    await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
    alert("Booking cancelled.");
  };

  const joinCall = (booking) => navigate(`/video-call/${booking.id}`);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="bg-orange-500 p-4">
        <h1 className="text-white text-2xl">My Bookings</h1>
      </header>
      <main className="mt-4">
        {bookings.map(bk => {
          const expert = experts[bk.expertId];
          return (
            <div key={bk.id} className="bg-white border p-4 rounded mb-4">
              <p><strong>Expert:</strong> {expert?.fullName || 'N/A'}</p>
              <p><strong>Status:</strong> {bk.status}</p>
              {bk.status === 'accepted' && bk.callStatus === 'started' && (
                <button onClick={() => joinCall(bk)} className="bg-blue-600 px-3 py-1 text-white rounded">Join Call</button>
              )}
              {bk.status === 'accepted' && !bk.callStatus && (
                <p className="text-gray-500 italic">Waiting for expert to start the call...</p>
              )}
              {(bk.status === 'pending') && (
                <button onClick={() => cancelBooking(bk.id)} className="bg-red-600 px-3 py-1 text-white rounded">Cancel</button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default UserBookingActivity;







































// import React, { useEffect, useState } from 'react';
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   doc,
//   updateDoc,
//   getDocs,
// } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from '../../config/firebase/config';

// const UserBookingActivity = () => {
//   const auth = getAuth();
//   const user = auth.currentUser;

//   const [bookings, setBookings] = useState([]);
//   const [experts, setExperts] = useState({});
//   const [showModal, setShowModal] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);

//   useEffect(() => {
//     if (!user) return;

//     const q = query(collection(db, "bookings"), where("userId", "==", user.uid));

//     const unsubscribe = onSnapshot(q, async (snapshot) => {
//       const bookingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setBookings(bookingList);

//       const expertIds = [...new Set(bookingList.map(b => b.expertId))];
//       const expertMap = {};

//       await Promise.all(
//         expertIds.map(async (expertId) => {
//           if (!expertId) return;
//           try {
//             const q = query(collection(db, "FYPusers"), where("uid", "==", expertId));
//             const querySnapshot = await getDocs(q);

//             if (!querySnapshot.empty) {
//               expertMap[expertId] = querySnapshot.docs[0].data();
//             } else {
//               console.warn("Expert not found for ID:", expertId);
//             }
//           } catch (error) {
//             console.error("Error fetching expert:", error);
//           }
//         })
//       );

//       setExperts(expertMap);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   const cancelBooking = async (id) => {
//     try {
//       await updateDoc(doc(db, "bookings", id), {
//         status: "cancelled"
//       });
//       alert("Booking cancelled.");
//     } catch (error) {
//       console.error("Cancel error:", error);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow-md">
//         <h1 className="text-white text-3xl font-bold tracking-wide">My Bookings</h1>
//       </header>

//       <main className="max-w-4xl mx-auto mt-8">
//         <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Bookings</h2>

//         {bookings.length === 0 ? (
//           <p className="text-center text-gray-500 mt-12 text-lg">No bookings found.</p>
//         ) : (
//           bookings.map((booking) => {
//             const expert = experts[booking.expertId];

//             return (
//               <div
//                 key={booking.id}
//                 className="bg-white shadow-lg rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6"
//               >
//                 {/* Expert Profile */}
//                 {booking.expertId && expert ? (
//                   <div className="flex-shrink-0">
//                     <img
//                       src={expert.profileUrl || '/default-profile.png'}
//                       alt={`${expert.fullName} profile`}
//                       className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
//                     />
//                   </div>
//                 ) : (
//                   <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-full text-gray-400 font-medium">
//                     N/A
//                   </div>
//                 )}

//                 {/* Booking & Expert Details */}
//                 <div className="flex-grow space-y-2">
//                   {booking.expertId ? (
//                     expert ? (
//                       <>
//                         <p className="text-xl font-semibold text-gray-900">{expert.fullName}</p>
//                         <p className="text-gray-600">{expert.email}</p>
//                         <p className="text-gray-600">Charges: {expert.charges}</p>
//                         {expert.phone && <p className="text-gray-600">📞 {expert.phone}</p>}
//                         {expert.specialization && (
//                           <p className="text-sm text-orange-600 font-medium">{expert.specialization}</p>
//                         )}
//                       </>
//                     ) : (
//                       <p className="italic text-gray-500">Loading expert info...</p>
//                     )
//                   ) : (
//                     <p className="italic text-red-500">Expert ID not found in booking</p>
//                   )}

//                   <hr className="my-3" />

//                   <p>
//                     <span className="font-semibold">Service Date:</span> {booking.date} at {booking.time}
//                   </p>
//                   <p>
//                     <span className="font-semibold">Status:</span>{' '}
//                     <span
//                       className={`font-semibold ${booking.status === 'pending'
//                         ? 'text-yellow-500'
//                         : booking.status === 'accepted'
//                           ? 'text-green-600'
//                           : booking.status === 'rejected'
//                             ? 'text-gray-600'
//                             : booking.status === 'cancelled'
//                               ? 'text-red-500'
//                               : 'text-gray-700'
//                         }`}
//                     >
//                       {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                     </span>
//                   </p>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex flex-col items-center gap-3">
//                   {booking.status === 'pending' && (
//                     <>
//                       <button
//                         className="px-11 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded cursor-not-allowed"
//                         disabled
//                       >
//                         Pending
//                       </button>
//                       <button
//                         onClick={() => cancelBooking(booking.id)}
//                         className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//                       >
//                         Cancel Booking
//                       </button>
//                     </>
//                   )}

//                   {booking.status === 'accepted' && (
//                     <>
//                       <button className="px-5 py-2 bg-green-600 text-white rounded cursor-default" disabled>
//                         Accepted
//                       </button>
//                       <button
//                         onClick={() => {
//                           setSelectedBooking(booking);
//                           setShowModal(true);
//                         }}
//                         className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                       >
//                         Pay Now
//                       </button>
//                     </>
//                   )}

//                   {booking.status === 'rejected' && (
//                     <button className="px-5 py-2 bg-gray-600 text-white rounded cursor-default" disabled>
//                       Rejected
//                     </button>
//                   )}

//                   {booking.status === 'cancelled' && (
//                     <button className="px-5 py-2 bg-red-400 text-white rounded cursor-default" disabled>
//                       Cancelled
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </main>

//         {/* Payment */}
//       {showModal && selectedBooking && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 sm:px-6">
//           <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-6 border border-gray-200 relative">
//             {/* Header */}
//             <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 tracking-tight">
//               Complete Your Payment
//             </h2>

//             {/* Booking Info */}
//             <div className="space-y-4 text-sm sm:text-base text-gray-700">
//               <div className="grid gap-1">
//                 <p><span className="font-semibold">👤 User UID:</span> {user?.uid}</p>
//                 <p><span className="font-semibold">🧾 User Name:</span> {user?.displayName || 'N/A'}</p>
//                 <p><span className="font-semibold">🧑‍💼 Expert UID:</span> {experts[selectedBooking.expertId]?.uid || "N/A"}</p>
//                 <p><span className="font-semibold">💼 Expert Name:</span> {experts[selectedBooking.expertId]?.fullName || "N/A"}</p>
//                 <p><span className="font-semibold">📅 Date & Time:</span> {new Date().toLocaleString()}</p>
//               </div>

//               {/* Upload Screenshot */}
//               <div className="pt-4">
//                 <label className="block font-semibold mb-2 text-gray-800">
//                   Upload Payment Screenshot
//                 </label>
//                 <button
//                   type="button"
//                   className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:opacity-90 transition-all"
//                 >
//                   Upload Screenshot
//                 </button>
//               </div>

//               {/* Instructions Box */}
//               <div className="bg-white border border-orange-200 rounded-xl p-4 mt-5 text-sm shadow-sm">
//                 <p className="text-orange-700 font-semibold mb-2">📌 EasyPaisa Payment Instructions:</p>
//                 <ul className="list-disc pl-5 space-y-1 text-gray-700">
//                   <li>Send to <strong>0315-1231234</strong></li>
//                   <li>Amount: Rs. <strong>{experts[selectedBooking.expertId]?.charges || "N/A"}</strong></li>
//                   <li>Attach Transaction ID, Date & Time in screenshot</li>
//                 </ul>
//                 <p className="mt-3 text-gray-600">
//                   Use the EasyPaisa app or a mobile shop. For support, contact <strong>0315-1231234</strong>.
//                 </p>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="mt-6 flex flex-col sm:flex-row gap-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-full py-2 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   alert("Payment processing...");
//                 }}
//                 className="w-full py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
//               >
//                 Submit Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// };

// export default UserBookingActivity;












































