import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from '../../config/firebase/config';

const UserBookingActivity = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  // State for bookings + expert details
  const [bookingsWithExperts, setBookingsWithExperts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // For each booking, fetch expert data from FYPusers by expertId
      const bookingsWithExpertData = await Promise.all(
        bookingList.map(async (booking) => {
          if (booking.expertId) {
            const expertDoc = await getDoc(doc(db, "FYPusers", booking.expertId));
            if (expertDoc.exists()) {
              return { ...booking, expertData: expertDoc.data() };
            }
          }
          return { ...booking, expertData: null };
        })
      );

      setBookingsWithExperts(bookingsWithExpertData);
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
    <div className="p-6">
      <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow">
        <h1 className="text-white text-2xl md:text-3xl font-bold">My booking</h1>
      </header>
      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
      {bookingsWithExperts.length === 0 && <p>No bookings found.</p>}

      {bookingsWithExperts.map((booking) => (
        <div key={booking.id} className="border p-4 rounded mb-4">
          <p><strong>Service Date:</strong> {booking.date} {booking.time}</p>
          <p><strong>Status:</strong> {booking.status}</p>

          {/* Show expert info if available */}
          {booking.expertData ? (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <h3 className="font-semibold">Expert Info:</h3>
              <p><strong>Name:</strong> {booking.expertData.name}</p>
              <p><strong>Email:</strong> {booking.expertData.email}</p>
              <p><strong>Phone:</strong> {booking.expertData.phone}</p>
              <p><strong>Address:</strong> {booking.expertData.address}</p>
            </div>
          ) : (
            <p>Loading expert info...</p>
          )}

          {booking.status === "pending" && (
            <>
              <button className="mr-4 px-4 py-2 bg-yellow-400 rounded cursor-not-allowed" disabled>Pending</button>
              <button
                onClick={() => cancelBooking(booking.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel Booking
              </button>
            </>
          )}

          {booking.status === "accepted" && (
            <button className="px-4 py-2 bg-green-600 text-white rounded" disabled>Accepted</button>
          )}

          {booking.status === "rejected" && (
            <button className="px-4 py-2 bg-gray-600 text-white rounded" disabled>Rejected</button>
          )}

          {booking.status === "cancelled" && (
            <button className="px-4 py-2 bg-red-400 text-white rounded" disabled>Cancelled</button>
          )}
        </div>
      ))}
    </div>
  );
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




















