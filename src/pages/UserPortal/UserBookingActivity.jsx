import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../config/firebase/config';
import { useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const APP_ID = 925009695;
const SERVER_SECRET = '799364b76389affb5240b656051b4f8f';

const UserBookingActivity = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCallModal, setShowCallModal] = useState(false);
  const [currentCallBooking, setCurrentCallBooking] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Get bookings for user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch expert details
  useEffect(() => {
    const fetchExperts = async () => {
      const expertIds = [...new Set(bookings.map(b => b.expertId))];
      const expertMap = {};

      await Promise.all(
        expertIds.map(async (expertId) => {
          if (!expertId) return;
          try {
            const q = query(collection(db, "FYPusers"), where("uid", "==", expertId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              expertMap[expertId] = querySnapshot.docs[0].data();
            }
          } catch (error) {
            console.error("Error fetching expert:", error);
          }
        })
      );

      setExperts(expertMap);
    };

    if (bookings.length > 0) fetchExperts();
  }, [bookings]);

  const cancelBooking = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const deleteBooking = async (id) => {
    try {
      if (window.confirm("Are you sure you want to permanently delete this booking?")) {
        await deleteDoc(doc(db, "bookings", id));
        toast.success("Booking deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  // Cloudinary Upload Widget Function
  const openUploadWidget = () => {
    if (!window.cloudinary) {
      toast.error("Cloudinary is not loaded yet. Try again later.");
      return;
    }
    let myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dnak9yzfk",
        uploadPreset: "exp-hack",
        sources: ['local', 'camera'],
        cropping: false,
        multiple: false,
        maxImageFileSize: 5000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png']
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setImageUrl(result.info.secure_url);
          toast.success("Payment proof uploaded successfully!");
        } else if (error) {
          console.error("Upload Error:", error);
          toast.error("Failed to upload payment proof!");
        }
      }
    );
    myWidget.open();
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!selectedBooking) return;
    
    if (!imageUrl) {
      toast.error("Please upload a payment screenshot first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new payment document in Firestore
      const paymentData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        expertId: selectedBooking.expertId,
        expertName: experts[selectedBooking.expertId]?.fullName || 'Unknown Expert',
        bookingId: selectedBooking.id,
        amount: experts[selectedBooking.expertId]?.charges || 0,
        screenshotUrl: imageUrl,
        status: 'pending', // pending, verified, rejected
        paymentMethod: 'easypaisa',
        timestamp: new Date().toISOString(),
      };

      // Add to payments collection
      const paymentsRef = collection(db, "UserPayments");
      await addDoc(paymentsRef, paymentData);

      // Update booking payment status
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        paymentStatus: 'pending'
      });

      toast.success("Payment submitted successfully! The expert will verify your payment.");
      setShowModal(false);
      setImageUrl('');
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCall = async (booking) => {
    try {
      setCurrentCallBooking(booking);
      setShowCallModal(true);
    } catch (error) {
      console.error("Error starting call:", error);
      setShowCallModal(false);
      toast.error("Failed to start the call");
    }
  };

  const initializeCall = () => {
    if (!currentCallBooking || !user) return;

    const callID = currentCallBooking.id;
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID,
      SERVER_SECRET,
      callID,
      user.uid,
      user.displayName || user.email
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
    if (showCallModal && currentCallBooking) {
      initializeCall();
    }
  }, [showCallModal, currentCallBooking]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Payment Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 sm:px-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-6 border border-gray-200 relative">
            {/* Header */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 tracking-tight">
              Complete Your Payment
            </h2>

            {/* Booking Info */}
            <div className="space-y-4 text-sm sm:text-base text-gray-700">
              <div className="grid gap-1">
                <p><span className="font-semibold">👤 Customer:</span> {user?.displayName || 'N/A'}</p>
                <p><span className="font-semibold">🧑‍💼 Expert:</span> {experts[selectedBooking.expertId]?.fullName || "N/A"}</p>
                <p><span className="font-semibold">💰 Amount:</span> Rs. {experts[selectedBooking.expertId]?.charges || "N/A"}</p>
                <p><span className="font-semibold">📅 Date:</span> {new Date().toLocaleString()}</p>
              </div>

              {/* Upload Screenshot */}
              <div className="pt-4">
                <label className="block font-semibold mb-2 text-gray-800">
                  Payment Proof (Screenshot)
                </label>
                <button
                  type="button"
                  onClick={openUploadWidget}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:opacity-90 transition-all"
                >
                  {imageUrl ? 'Proof Uploaded ✔' : 'Upload Payment Proof'}
                </button>
              </div>

              {/* Instructions Box */}
              <div className="bg-white border border-orange-200 rounded-xl p-4 mt-5 text-sm shadow-sm">
                <p className="text-orange-700 font-semibold mb-2">📌 EasyPaisa Payment Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Send to <strong>0315-1231234</strong></li>
                  <li>Amount: Rs. <strong>{experts[selectedBooking.expertId]?.charges || "N/A"}</strong></li>
                  <li>Include complete transaction details in screenshot</li>
                </ul>
                <p className="mt-3 text-gray-600">
                  After payment, upload a clear screenshot showing transaction details.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setImageUrl('');
                }}
                className="w-full py-2 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="w-full py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center justify-center"
                disabled={isSubmitting || !imageUrl}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {experts[currentCallBooking?.expertId]?.fullName || 'Expert'}
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Consultations</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">View and manage your scheduled consultations</p>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-500">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-1 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md transition-colors duration-200"
              >
                <option value="all">All ({bookings.length})</option>
                <option value="pending">Pending ({statusCounts.pending || 0})</option>
                <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                <option value="completed">Completed ({statusCounts.completed || 0})</option>
                <option value="cancelled">Cancelled ({statusCounts.cancelled || 0})</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-500">Total Consultations</p>
              <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
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
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center transition-opacity duration-300">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="mt-3 md:mt-4 text-lg font-medium text-gray-900">No consultation bookings</h3>
              <p className="mt-1 text-sm md:text-base text-gray-500 max-w-md mx-auto">
                {filter === 'all'
                  ? "You haven't booked any consultations yet. When you do, they'll appear here."
                  : `You don't have any ${filter} consultations. Try changing the filter to see others.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {filteredBookings.map((booking) => {
                const expert = experts[booking.expertId] || {};
                const isActiveCall = showCallModal && currentCallBooking?.id === booking.id;
                const statusColors = {
                  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
                  accepted: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
                  completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
                  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
                };

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${isActiveCall ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <div className="p-4 md:p-6">
                      {/* Booking Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 relative">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                              <img
                                className="h-full w-full object-cover"
                                src={expert.profileUrl || 'https://avatar.vercel.sh/unknown'}
                                alt={expert.fullName || 'Anonymous Expert'}
                              />
                            </div>
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-2 ring-white ${booking.status === 'pending' ? 'bg-yellow-400' :
                              booking.status === 'accepted' ? 'bg-green-500' :
                                booking.status === 'completed' ? 'bg-blue-500' :
                                  'bg-red-500'
                              }`}></span>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
                              {expert.fullName || 'Anonymous Expert'}
                            </h3>
                            <p className="text-sm text-gray-500">{expert.specialization || 'No specialization provided'}</p>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium ${statusColors[booking.status].bg
                            } ${statusColors[booking.status].text} ${statusColors[booking.status].border}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="mt-4 md:mt-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
                              <p className="text-sm font-mono font-medium text-gray-900 mt-1 truncate" title={booking.verificationCode}>
                                {booking.verificationCode}
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
                                <span className="block truncate" title={booking.date}>{booking.date}</span>
                                <span className="text-gray-600 text-xs sm:text-sm">at {booking.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expert Contact Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Expert Contact</p>
                              <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={expert.phone || 'Not provided'}>
                                {expert.phone || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price Card */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all duration-200 group">
                          <div className="flex items-start sm:items-center gap-2">
                            <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors duration-200 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Price</p>
                              <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                                {expert.charges ? `Rs. ${expert.charges}` : 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
                        {booking.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        ) : booking.status === 'accepted' ? (
                          <>
                            {booking.callStatus === 'started' ? (
                              <>
                                <button
                                  onClick={() => startCall(booking)}
                                  disabled={isActiveCall}
                                  className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white ${isActiveCall
                                    ? 'bg-orange-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 hover:scale-[1.02] active:scale-95`}
                                >
                                  <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  {isActiveCall ? 'Call Ongoing' : (isMobile ? 'Join Call' : 'Join Video Consultation')}
                                </button>
                                
                                {/* Payment Button - Toggles based on paymentStatus */}
                                {booking.paymentStatus === 'pending' ? (
                                  <button
                                    disabled
                                    className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gray-500 cursor-not-allowed"
                                  >
                                    <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pending Payment Verification
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                  >
                                    <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pay Now
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed">
                                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Waiting for expert to start call
                                </div>
                                <button
                                  onClick={() => deleteBooking(booking.id)}
                                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                >
                                  <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </button>
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
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

export default UserBookingActivity;














// import React, { useEffect, useState } from 'react';
// import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from '../../config/firebase/config';
// import { useNavigate } from 'react-router-dom';

// const APP_ID = 297250868;
// const SERVER_SECRET = 'b629a7c9f6478129ba54a3ffb5623740';

// const UserBookingActivity = () => {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const [bookings, setBookings] = useState([]);
//   const [experts, setExperts] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) return;
//     const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
//     return onSnapshot(q, async snap => {
//       const bs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setBookings(bs);
//       const ids = [...new Set(bs.map(b => b.expertId))];
//       const exMap = {};
//       await Promise.all(ids.map(async eid => {
//         const q2 = query(collection(db, "FYPusers"), where("uid", "==", eid));
//         const snap2 = await getDocs(q2);
//         if (!snap2.empty) exMap[eid] = snap2.docs[0].data();
//       }));
//       setExperts(exMap);
//     });
//   }, [user]);
  

//   const cancelBooking = async id => {
//     await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
//     alert("Booking cancelled.");
//   };

//   const joinCall = (booking) => navigate(`/video-call/${booking.id}`);

//   return (
//     <div>
//       <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow-md">
//         <h1 className="text-white text-3xl font-bold tracking-wide">My Bookings</h1>      </header>
//       <main className="mt-4">
//         {bookings.map(bk => {
//           const expert = experts[bk.expertId];
//           return (
//             <div key={bk.id} className="bg-white border p-4 rounded mb-4">
//               <p><strong>Expert:</strong> {expert?.fullName || 'N/A'}</p>
//               <p><strong>Status:</strong> {bk.status}</p>
//               {bk.status === 'accepted' && bk.callStatus === 'started' && (
//                 <button onClick={() => joinCall(bk)} className="bg-blue-600 px-3 py-1 text-white rounded">Join Call</button>
//               )}
//               {bk.status === 'accepted' && !bk.callStatus && (
//                 <p className="text-gray-500 italic">Waiting for expert to start the call...</p>
//               )}
//               {(bk.status === 'pending') && (
//                 <button onClick={() => cancelBooking(bk.id)} className="bg-red-600 px-3 py-1 text-white rounded">Cancel</button>
//               )}
//             </div>
//           );
//         })}
//       </main>
//     </div>
//   );
// };

// export default UserBookingActivity;







































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












































