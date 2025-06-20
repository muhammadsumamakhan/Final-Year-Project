import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../config/firebase/config';
import { useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const APP_ID = 297250868;
const SERVER_SECRET = 'b629a7c9f6478129ba54a3ffb5623740';

const ExpertOrder = () => {
  const auth = getAuth();
  const [expert, setExpert] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setExpert(user);
    });
  }, []);

  useEffect(() => {
    if (!expert) return;
    const q = query(collection(db, "bookings"), where("expertId", "==", expert.uid));
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [expert]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status });
    alert(`Booking ${status}`);
  };

  const startCall = async (order) => {
    const callID = order.id;

    // Step 1: Update Firestore to notify the user
    await updateDoc(doc(db, "bookings", callID), { callStatus: "started" });

    // Step 2: Launch Zego call
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID, SERVER_SECRET, callID, expert.uid, expert.displayName || expert.email
    );
    const zp = ZegoUIKitPrebuilt.create(token);
    zp.joinRoom({
      container: document.getElementById(`zego-${callID}`),
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall }
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
      {orders.length === 0 && <p>No booking requests found.</p>}
      {orders.map(order => (
        <div key={order.id} className="border p-4 rounded mb-4">
          <p><strong>User:</strong> {order.name}</p>
          <p><strong>Date:</strong> {order.date} {order.time}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {order.status === "pending" ? (
            <>
              <button onClick={() => updateStatus(order.id, "accepted")} className="mr-4 bg-green-600 px-3 py-1 text-white rounded">Accept</button>
              <button onClick={() => updateStatus(order.id, "rejected")} className="bg-red-600 px-3 py-1 text-white rounded">Reject</button>
            </>
          ) : order.status === "accepted" ? (
            <>
              <button onClick={() => startCall(order)} className="bg-blue-600 px-3 py-1 text-white rounded">📹 Start Call</button>
              <div id={`zego-${order.id}`} className="my-4 w-full h-96" />
            </>
          ) : (
            <button disabled className="bg-gray-400 px-3 py-1 text-white rounded">{order.status}</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpertOrder;









































// import React, { useEffect, useState } from 'react';
// import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from '../../config/firebase/config';

// const ExpertOrder = () => {
//   const auth = getAuth();
//   const [user, setUser] = useState(null); // store current user
//   const [orders, setOrders] = useState([]);

//   // Track auth state
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   // Fetch bookings for this expert
//   useEffect(() => {
//     if (!user) return;

//     const q = query(collection(db, "bookings"), where("expertId", "==", user.uid));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setOrders(list);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   // Update booking status
//   const updateStatus = async (id, status) => {
//     try {
//       await updateDoc(doc(db, "bookings", id), { status });
//       alert(`Booking ${status}`);
//     } catch (error) {
//       console.error("Status update error:", error);
//       alert("Failed to update status");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
//       {orders.length === 0 && <p>No booking requests found.</p>}

//       {orders.map((order) => (
//         <div key={order.id} className="border p-4 rounded mb-4">
//           <p><strong>User:</strong> {order.name} ({order.email})</p>
//           <p><strong>Date & Time:</strong> {order.date} {order.time}</p>
//           <p><strong>Status:</strong> {order.status}</p>

//           {order.status === "pending" ? (
//             <>
//               <button
//                 onClick={() => updateStatus(order.id, "accepted")}
//                 className="mr-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={() => updateStatus(order.id, "rejected")}
//                 className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//               >
//                 Reject
//               </button>
//             </>
//           ) : (
//             <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
//               {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//             </button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ExpertOrder;
