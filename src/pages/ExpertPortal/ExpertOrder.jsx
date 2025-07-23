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
  const [showCallModal, setShowCallModal] = useState(false);
  const [currentCallOrder, setCurrentCallOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setCurrentCallOrder(order);
      setShowCallModal(true);
      
      const callID = order.id;
      await updateDoc(doc(db, 'bookings', callID), { callStatus: 'started' });
    } catch (error) {
      console.error('Error starting call:', error);
      setShowCallModal(false);
    }
  };

  const initializeCall = () => {
    if (!currentCallOrder || !expert) return;

    const callID = currentCallOrder.id;
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID,
      SERVER_SECRET,
      callID,
      expert.uid,
      expert.displayName || expert.email
    );
    
    const zp = ZegoUIKitPrebuilt.create(token);
    zp.joinRoom({
      container: document.getElementById('zego-call-container'),
      scenario: { 
        mode: ZegoUIKitPrebuilt.OneONoneCall,
        config: {
          // Mobile-specific configuration
          turnOnCameraWhenJoining: isMobile ? false : true, // Don't auto-start camera on mobile to save bandwidth
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: !isMobile, // Disable screen sharing on mobile
          showTextChat: true,
          showUserList: true,
        }
      },
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: !isMobile, // Don't auto-start camera on mobile
      layout: isMobile ? "Auto" : "Sidebar", // Different layout for mobile
      showLeavingView: false,
      onLeaveRoom: () => {
        setShowCallModal(false);
      },
    });
  };

  useEffect(() => {
    if (showCallModal && currentCallOrder) {
      initializeCall();
    }
  }, [showCallModal, currentCallOrder]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Call Modal - Responsive for both mobile and desktop */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
              isMobile ? 'w-full h-full' : 'sm:max-w-4xl sm:w-full'
            }`}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Video Consultation with {userMap[currentCallOrder?.userId]?.fullName || 'Client'}
                    </h3>
                    <div className="mt-2">
                      <div 
                        id="zego-call-container" 
                        className={`w-full ${isMobile ? 'h-[70vh]' : 'h-96'} bg-gray-800 rounded-lg`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8 transition-all duration-300">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Consultation Dashboard</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Manage your consultation requests and sessions</p>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-500">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-1 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="all">All ({orders.length})</option>
                <option value="pending">Pending ({statusCounts.pending || 0})</option>
                <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                <option value="completed">Completed ({statusCounts.completed || 0})</option>
                <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center transition-opacity duration-300">
              <div className="mx-auto h-20 w-20 md:h-24 md:w-24 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-3 md:mt-4 text-lg font-medium text-gray-900">No consultation requests</h3>
              <p className="mt-1 text-sm md:text-base text-gray-500">
                {filter === 'all' 
                  ? "You don't have any consultation requests yet."
                  : `You don't have any ${filter} consultation requests.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {filteredOrders.map((order) => {
                const user = userMap[order.userId] || {};
                const isActiveCall = showCallModal && currentCallOrder?.id === order.id;

                return (
                  <div 
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-4 md:p-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 relative">
                            <img
                              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-white shadow-sm"
                              src={user.photoURL || 'https://avatar.vercel.sh/unknown'}
                              alt=""
                            />
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-2 ring-white ${
                              order.status === 'pending' ? 'bg-yellow-400' :
                              order.status === 'accepted' ? 'bg-green-500' :
                              order.status === 'completed' ? 'bg-blue-500' :
                              'bg-red-500'
                            }`}></span>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
                              {user.fullName || 'Anonymous User'}
                            </h3>
                            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500">
                              <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{order.date} at {order.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</p>
                          <p className="text-xs md:text-sm text-gray-900 mt-1">{user.contact || 'Not provided'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</p>
                          <p className="text-xs md:text-sm text-gray-900 mt-1">{user.cnic || 'Not provided'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verification Code</p>
                          <p className="text-xs md:text-sm font-mono text-gray-900 truncate mt-1">{order.verificationCode}</p>
                        </div>
                        {!isMobile && (
                          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Schedule</p>
                            <p className="text-xs md:text-sm font-mono text-gray-900 truncate mt-1">{order.date} at {order.time}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
                        {order.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, 'accepted')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'rejected')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </button>
                          </>
                        ) : order.status === 'accepted' ? (
                          <>
                            <button
                              onClick={() => startCall(order)}
                              disabled={isActiveCall}
                              className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white ${
                                isActiveCall 
                                  ? 'bg-blue-400' 
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 active:scale-95`}
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {isActiveCall ? 'Call Ongoing' : (isMobile ? 'Start Call' : 'Start Video Consultation')}
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'completed')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {isMobile ? 'Complete' : 'Mark as Complete'}
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </button>
                        )}
                      </div>
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
