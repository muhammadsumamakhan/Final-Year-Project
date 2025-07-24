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
          turnOnCameraWhenJoining: isMobile ? false : true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: !isMobile,
          showTextChat: true,
          showUserList: true,
        }
      },
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: !isMobile,
      layout: isMobile ? "Auto" : "Sidebar",
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div
            className={`w-full ${isMobile ? 'h-full' : 'max-w-3xl max-h-[90vh]'
              } bg-white rounded-2xl shadow-lg flex flex-col`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Video Call with{' '}
                <span className="text-blue-600">
                  {userMap[currentCallOrder?.userId]?.fullName || 'Client'}
                </span>
              </h2>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Container */}
            <div
              id="zego-call-container"
              className={`flex-1 bg-gray-900 ${isMobile ? 'h-[70vh]' : 'h-[500px]'
                } rounded-xl m-4`}
            ></div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center gap-3 px-4 py-3 border-t">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-5 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition duration-200"
              >
                End Call
              </button>
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
                className="block w-full pl-3 pr-10 py-1 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md transition-colors duration-200"
              >
                <option value="all">All ({orders.length})</option>
                <option value="pending">Pending ({statusCounts.pending || 0})</option>
                <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                <option value="completed">Completed ({statusCounts.completed || 0})</option>
                <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
              </select>
            </div>
          </div>

          {/* Stats Cards - Now properly placed */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-500">Total Consultations</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.pending || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.accepted || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.completed || 0}</p>
            </div>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center transition-opacity duration-300">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="mt-3 md:mt-4 text-lg font-medium text-gray-900">No consultation requests</h3>
              <p className="mt-1 text-sm md:text-base text-gray-500 max-w-md mx-auto">
                {filter === 'all'
                  ? "You don't have any consultation requests yet. When you do, they'll appear here."
                  : `You don't have any ${filter} consultation requests. Try changing the filter to see others.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {filteredOrders.map((order) => {
                const user = userMap[order.userId] || {};
                const isActiveCall = showCallModal && currentCallOrder?.id === order.id;
                const statusColors = {
                  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
                  accepted: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
                  completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
                  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
                };

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${isActiveCall ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <div className="p-4 md:p-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 relative">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                              <img
                                className="h-full w-full object-cover"
                                src={user.photoURL || 'https://avatar.vercel.sh/unknown'}
                                alt={user.fullName || 'Anonymous User'}
                              />
                            </div>
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-2 ring-white ${order.status === 'pending' ? 'bg-yellow-400' :
                              order.status === 'accepted' ? 'bg-green-500' :
                                order.status === 'completed' ? 'bg-blue-500' :
                                  'bg-red-500'
                              }`}></span>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
                              {user.fullName || 'Anonymous User'}
                            </h3>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium ${statusColors[order.status].bg
                            } ${statusColors[order.status].text} ${statusColors[order.status].border}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Order Details - Single row layout */}
                      <div className="mt-4 md:mt-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        {/* Contact Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Contact</p>
                              <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={user.contact || 'Not provided'}>
                                {user.contact || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CNIC Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">CNIC</p>
                              <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={user.cnic || 'Not provided'}>
                                {user.cnic || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Verification Code Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Verification Code</p>
                              <p className="text-sm font-mono font-medium text-gray-900 mt-1 truncate" title={order.verificationCode}>
                                {order.verificationCode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Booking Schedule Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Booking</p>
                              <div className="text-sm font-medium text-gray-900 mt-1">
                                <span className="block truncate" title={order.date}>{order.date}</span>
                                <span className="text-gray-600 text-xs sm:text-sm">at {order.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
                        {order.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, 'accepted')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'rejected')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
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
                              className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white ${isActiveCall
                                ? 'bg-orange-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 hover:scale-[1.02] active:scale-95`}
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {isActiveCall ? 'Call Ongoing' : (isMobile ? 'Start Call' : 'Start Video Consultation')}
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'completed')}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-all duration-200 hover:scale-[1.02] active:scale-95"
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
