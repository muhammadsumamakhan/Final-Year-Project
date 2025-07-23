import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/firebase/config';
import { useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const APP_ID = 297250868;
const SERVER_SECRET = 'b629a7c9f6478129ba54a3ffb5623740';

const ExpertOrder = () => {
  const auth = getAuth();
  const [expert, setExpert] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCallId, setActiveCallId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  // Get currently logged-in expert
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setExpert(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Get bookings for expert
  useEffect(() => {
    if (!expert) return;
    setLoading(true);
    const q = query(collection(db, 'bookings'), where('expertId', '==', expert.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [expert]);

  // Fetch associated user details from FYPusers
  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = [...new Set(orders.map((b) => b.userId))];
      const tempUserMap = {};

      await Promise.all(
        userIds.map(async (userId) => {
          if (!userId) return;
          try {
            const q = query(collection(db, 'FYPusers'), where('uid', '==', userId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              tempUserMap[userId] = querySnapshot.docs[0].data();
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        })
      );

      setUserMap(tempUserMap);
    };

    if (orders.length > 0) fetchUsers();
  }, [orders]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const startCall = async (order) => {
    try {
      setActiveCallId(order.id);
      const callID = order.id;

      await updateDoc(doc(db, 'bookings', callID), { callStatus: 'started' });

      const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        callID,
        expert.uid,
        expert.displayName || expert.email
      );
      const zp = ZegoUIKitPrebuilt.create(token);
      zp.joinRoom({
        container: document.getElementById(`zego-${callID}`),
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        layout: "Auto",
        showLeavingView: false,
        onLeaveRoom: () => {
          setActiveCallId(null);
        },
      });
    } catch (error) {
      console.error('Error starting call:', error);
      setActiveCallId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Consultation Requests</h1>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {orders.length} {orders.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No consultation requests</h3>
              <p className="mt-1 text-gray-500">You don't have any pending consultation requests at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => {
                const user = userMap[order.userId] || {};
                const isActiveCall = activeCallId === order.id;

                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-full object-cover border border-gray-200"
                              src={user.photoURL || 'https://avatar.vercel.sh/unknown'}
                              alt=""
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-medium text-gray-900">{user.fullName || 'Anonymous User'}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>Verification: {order.verificationCode}</span>
                              <span>•</span>
                              <span>{order.date} at {order.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Contact</p>
                          <p className="text-sm text-gray-900">{user.contact || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">CNIC</p>
                          <p className="text-sm text-gray-900">{user.cnic || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Booking ID</p>
                          <p className="text-sm font-mono text-gray-900 truncate">{order.id}</p>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        {order.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, 'accepted')}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'rejected')}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Decline
                            </button>
                          </>
                        ) : order.status === 'accepted' ? (
                          <>
                            <button
                              onClick={() => startCall(order)}
                              disabled={isActiveCall}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                isActiveCall ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                              {isActiveCall ? 'Call Ongoing' : 'Start Video Consultation'}
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'completed')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Mark as Complete
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </button>
                        )}
                      </div>

                      {isActiveCall && (
                        <div className="mt-6">
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <div
                              id={`zego-${order.id}`}
                              className="w-full h-96 bg-gray-800"
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500 text-center">
                            Consultation in progress. Close this window to end the session.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertOrder;

















// import React, { useEffect, useState } from 'react';
// import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from '../../config/firebase/config';
// import { useNavigate } from 'react-router-dom';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// const APP_ID = 297250868;
// const SERVER_SECRET = 'b629a7c9f6478129ba54a3ffb5623740';

// const ExpertOrder = () => {
//   const auth = getAuth();
//   const [expert, setExpert] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) setExpert(user);
//     });
//   }, []);

//   useEffect(() => {
//     if (!expert) return;
//     const q = query(collection(db, "bookings"), where("expertId", "==", expert.uid));
//     return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
//   }, [expert]);

//   const updateStatus = async (id, status) => {
//     await updateDoc(doc(db, "bookings", id), { status });
//     alert(`Booking ${status}`);
//   };

//   const startCall = async (order) => {
//     const callID = order.id;

//     // Step 1: Update Firestore to notify the user
//     await updateDoc(doc(db, "bookings", callID), { callStatus: "started" });

//     // Step 2: Launch Zego call
//     const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       APP_ID, SERVER_SECRET, callID, expert.uid, expert.displayName || expert.email
//     );
//     const zp = ZegoUIKitPrebuilt.create(token);
//     zp.joinRoom({
//       container: document.getElementById(`zego-${callID}`),
//       scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall }
//     });
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
//       {orders.length === 0 && <p>No booking requests found.</p>}
//       {orders.map(order => (
//         <div key={order.id} className="border p-4 rounded mb-4">
//           <p><strong>User:</strong> {order.name}</p>
//           <p><strong>Date:</strong> {order.date} {order.time}</p>
//           <p><strong>Status:</strong> {order.status}</p>

//           {order.status === "pending" ? (
//             <>
//               <button onClick={() => updateStatus(order.id, "accepted")} className="mr-4 bg-green-600 px-3 py-1 text-white rounded">Accept</button>
//               <button onClick={() => updateStatus(order.id, "rejected")} className="bg-red-600 px-3 py-1 text-white rounded">Reject</button>
//             </>
//           ) : order.status === "accepted" ? (
//             <>
//               <button onClick={() => startCall(order)} className="bg-blue-600 px-3 py-1 text-white rounded">📹 Start Call</button>
//               <div id={`zego-${order.id}`} className="my-4 w-full h-96" />
//             </>
//           ) : (
//             <button disabled className="bg-gray-400 px-3 py-1 text-white rounded">{order.status}</button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ExpertOrder;









































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
