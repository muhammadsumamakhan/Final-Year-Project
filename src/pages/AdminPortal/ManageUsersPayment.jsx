import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from '../../config/firebase/config';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiCheck, FiX, FiEye, FiDollarSign, FiKey, FiUser, FiPhone, FiClock, FiDownload } from 'react-icons/fi';
import { FaUserTie, FaUserCheck, FaUserClock } from 'react-icons/fa';

const ManageUsersPayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getNetAmount(amount) {
    const num = parseFloat(amount);
    return isNaN(num) ? "N/A" : num.toFixed(2);
  }

  const openUploadWidget = () => {
    // your upload logic...
  };

  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    try {
      toast.success("Payment processed successfully!");
      setShowPaymentModal(false);
    } catch (error) {
      toast.error("Error processing payment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "UserPayments"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const paymentsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayments(paymentsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      await updateDoc(doc(db, "UserPayments", paymentId), {
        paymentStatus: status,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin'
      });
      toast.success(`Payment ${status} successfully`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(`Failed to ${status} payment`);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.paymentStatus !== filter) return false;
    if (!searchQuery) return true;
    const ql = searchQuery.toLowerCase();
    return (
      payment.userName?.toLowerCase().includes(ql) ||
      payment.expertName?.toLowerCase().includes(ql) ||
      payment.verificationCode?.toLowerCase().includes(ql) ||
      payment.amount?.toString().includes(ql)
    );
  });

  const statusCounts = payments.reduce((acc, p) => {
    acc[p.paymentStatus] = (acc[p.paymentStatus] || 0) + 1;
    return acc;
  }, {});

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ... header ... */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-32">
        <button
          onClick={() => navigate('/adminportal')}
          className="flex items-center text-white text-lg sm:text-xl md:text-2xl font-bold transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Manage Customer Payments
        </button>
      </header>

      {/* Payment Modal */}
      {showPaymentModal && selectedPaymentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 sm:px-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-6 border border-gray-200 relative">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 tracking-tight">
              Process Expert Payment
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-gray-700">
              <div className="grid gap-1">
                <p><span className="font-semibold">👤 Customer:</span> {selectedPaymentForModal.userName || 'N/A'}</p>
                <p><span className="font-semibold">🧑‍💼 Expert:</span> {selectedPaymentForModal.expertName || 'N/A'}</p>
                <p className="flex items-center">
                    <span className="font-semibold flex items-center">
                      <FiKey className="mr-2 w-4 h-4 text-blue-500" />
                      Verification Code:
                    </span>
                    <span className="ml-2">
                      {selectedPaymentForModal.verificationCode || 'N/A'}
                    </span>
                </p>
                <p><span className="font-semibold">💰 Amount:</span> Rs. {selectedPaymentForModal.amount || 'N/A'}</p>
                <p><span className="font-semibold">📅 Date:</span> {new Date(selectedPaymentForModal.timestamp?.toDate() || new Date()).toLocaleString()}</p>
              </div>

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

              <div className="bg-white border border-orange-200 rounded-xl p-4 mt-5 text-sm shadow-sm">
                <p className="text-orange-700 font-semibold mb-2">📌 Payment Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Send to <strong className="text-blue-600">{selectedPaymentForModal.expertContact || 'N/A'}</strong></li>
                  {/* Amount Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-600">Gross Amount:</span>
                    <strong className="text-gray-900">Rs. {selectedPaymentForModal?.amount || "N/A"}</strong>
                  </div>
                  {selectedPaymentForModal?.amount && (
                    <div className="flex items-start text-sm text-gray-500">
                      <div>
                        <span className="text-gray-600">Admin sends: </span>
                        <span className="font-medium text-gray-800 text-base">
                          Rs. {(selectedPaymentForModal.amount * 0.9).toFixed(2)}
                        </span>
                        <span className="ml-1.5 text-orange-500">(10% fee deducted)</span>
                      </div>
                    </div>
                  )}
                </div>
                  <li>Include complete transaction details in screenshot</li>
                </ul>
                <p className="mt-3 text-gray-600">
                  After payment, upload a clear screenshot showing transaction details.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setShowPaymentModal(false); setImageUrl(''); }}
                className="w-full py-2 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
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

      <ToastContainer position="top-right" autoClose={5000} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Stats Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Search by user, expert, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All ({payments.length})
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Pending ({statusCounts.pending || 0})
                  </button>
                  <button
                    onClick={() => setFilter('accepted')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Accepted ({statusCounts.accepted || 0})
                  </button>
                  <button
                    onClick={() => setFilter('rejected')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Rejected ({statusCounts.rejected || 0})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaUserClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaUserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.accepted || 0}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

{/* Payments Table - Compact Desktop Version */}
<div className="bg-white rounded-xl shadow-sm overflow-hidden">
  {/* Desktop Table */}
  <div className="hidden md:block">
    <table className="w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
         <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Payment
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredPayments.length === 0 ? (
          <tr>
            <td colSpan="10" className="px-4 py-3 text-center text-sm text-gray-500">
              No payments found matching your criteria
            </td>
          </tr>
        ) : (
          filteredPayments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {payment.userName || 'Anonymous'}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUserTie className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {payment.expertName || 'Expert'}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                Rs. {payment.amount || '0'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {payment.expertContact ? (
                    <a 
                      href={`tel:${payment.expertContact}`} 
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <FiPhone className="flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{payment.expertContact}</span>
                    </a>
                  ) : 'N/A'}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded">
                  {payment.verificationCode || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {payment.screenshotUrl ? (
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium hover:bg-indigo-200 transition-colors"
                  >
                    <FiEye className="mr-1" /> View
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">No proof</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                  payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  payment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.paymentStatus?.charAt(0).toUpperCase() + payment.paymentStatus?.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiClock className="flex-shrink-0" />
                  <span>{new Date(payment.timestamp?.toDate() || new Date()).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                {payment.paymentStatus === 'pending' ? (
                  <div className="flex space-x-1 justify-end">
                    <button
                      onClick={() => updatePaymentStatus(payment.id, 'accepted')}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors flex items-center"
                    >
                      <FiCheck className="mr-1" /> Accept
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors flex items-center"
                    >
                      <FiX className="mr-1" />Reject 
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Verified</span>
                )}
              </td>  
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  onClick={() => {
                    setSelectedPaymentForModal(payment);
                    setShowPaymentModal(true);
                  }}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <FiDollarSign className="mr-1" />
                  Pay Now
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Mobile Cards */}
  <div className="md:hidden space-y-4 p-4">
    {filteredPayments.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        No payments found matching your criteria
      </div>
    ) : (
      filteredPayments.map((payment) => (
        <div key={payment.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <FiUser className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{payment.userName || 'Anonymous'}</h3>
                  <p className="text-xs text-gray-500">To: {payment.expertName || 'Expert'}</p>
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              payment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {payment.paymentStatus?.charAt(0).toUpperCase() + payment.paymentStatus?.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-bold text-gray-900">Rs. {payment.amount || '0'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expert Contact</p>
              <p className="text-sm text-gray-900">
                {payment.expertContact ? (
                  <a href={`tel:${payment.expertContact}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                    <FiPhone className="mr-1" size={12} />
                    {payment.expertContact}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Verification Code</p>
              <p className="font-mono text-sm text-gray-900">{payment.verificationCode || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            {payment.screenshotUrl ? (
              <button
                onClick={() => setSelectedPayment(payment)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FiEye className="mr-1" /> View Proof
              </button>
            ) : (
              <span className="text-sm text-gray-400">No proof</span>
            )}

            {payment.paymentStatus === 'pending' ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => updatePaymentStatus(payment.id, 'accepted')}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors flex items-center"
                >
                  <FiCheck className="mr-1" /> Accept
                </button>
                <button
                  onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors flex items-center"
                >
                  <FiX className="mr-1" /> Reject 
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Verified</span>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                setSelectedPaymentForModal(payment);
                setShowPaymentModal(true);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiDollarSign className="mr-2" />
              Pay Now
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</div>

        {/* Payment Proof Modal */}
  {selectedPayment?.screenshotUrl && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white/95 backdrop-blur-lg rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
      
      {/* Header - Responsive */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Payment Verification
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedPayment.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                selectedPayment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedPayment.paymentStatus?.toUpperCase()}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                #{selectedPayment.verificationCode || 'N/A'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedPayment(null)}
            className="p-2 rounded-full hover:bg-gray-100/50 transition-all self-end sm:self-auto"
          >
            <FiX className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content - Responsive Stack */}
      <div className="flex flex-col lg:flex-row">
        {/* Payment Proof - Mobile First */}
        <div className="p-4 sm:p-6 lg:w-1/2 lg:border-r border-white/10">
          <div className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="font-medium text-gray-700">Payment Receipt</h3>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedPayment.screenshotUrl;
                  link.download = `payment_${selectedPayment.verificationCode || selectedPayment.id}.jpg`;
                  link.click();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiDownload className="mr-1.5" /> Download
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden" 
                 style={{ minHeight: '200px', maxHeight: '300px' }}>
              <img
                src={selectedPayment.screenshotUrl}
                alt="Payment proof"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.src = '/payment-error-placeholder.svg';
                  e.target.className = 'h-40 object-contain opacity-40';
                }}
              />
            </div>
          </div>
        </div>

        {/* Transaction Details - Responsive */}
        <div className="p-4 sm:p-6 lg:w-1/2 space-y-4 sm:space-y-6">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-xl border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Rs. {selectedPayment.amount?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-white/80 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-blue-700 border border-blue-200">
                {selectedPayment.paymentMethod || 'Unknown'}
              </div>
            </div>
          </div>

          {/* User Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FiUser className="text-blue-600 w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900 truncate">{selectedPayment.userName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{selectedPayment.userId}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FaUserTie className="text-purple-600 w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-gray-500">Expert</p>
                  <p className="font-medium text-gray-900 truncate">{selectedPayment.expertName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{selectedPayment.expertId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Actions - Responsive */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Submitted</p>
                <p className="text-sm">
                  {new Date(selectedPayment.timestamp?.toDate() || new Date())
                    .toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                </p>
              </div>
              {selectedPayment.verifiedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Verified</p>
                  <p className="text-sm">
                    {new Date(selectedPayment.verifiedAt)
                      .toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                  </p>
                </div>
              )}
            </div>

            {selectedPayment.paymentStatus === 'pending' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    updatePaymentStatus(selectedPayment.id, 'rejected');
                    setSelectedPayment(null);
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <FiX className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-sm sm:text-base">Reject</span>
                </button>
                <button
                  onClick={() => {
                    updatePaymentStatus(selectedPayment.id, 'accepted');
                    setSelectedPayment(null);
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-sm sm:text-base">Approve</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Responsive */}
      <div className="bg-gray-50/50 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-200/50 text-xs text-gray-500">
        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
          <span className="truncate">Booking ID: {selectedPayment.bookingId || 'N/A'}</span>
          <span className="truncate">System Ref: {selectedPayment.id}</span>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default ManageUsersPayment;









































// import React, { useEffect, useState } from 'react';
// import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
// import { db } from '../../config/firebase/config';
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from 'react-router-dom';
// import { FiArrowLeft, FiSearch, FiCheck, FiX, FiEye, FiDollarSign, FiUser, FiClock, FiDownload } from 'react-icons/fi';
// import { FaUserTie, FaUserCheck, FaUserClock } from 'react-icons/fa';

// const ManageUsersPayment = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const navigate = useNavigate();

//   // Fetch all payments
//   useEffect(() => {
//     setLoading(true);
//     const q = query(collection(db, "UserPayments"));
//     const unsubscribe = onSnapshot(q, (snap) => {
//       const paymentsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setPayments(paymentsData);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const updatePaymentStatus = async (paymentId, status) => {
//     try {
//       await updateDoc(doc(db, "UserPayments", paymentId), {
//         paymentStatus: status,
//         verifiedAt: new Date().toISOString(),
//         verifiedBy: 'Admin' // Replace with actual admin ID/name
//       });
//       toast.success(`Payment ${status} successfully`, {
//         position: "top-center",
//         autoClose: 2000,
//       });
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//       toast.error(`Failed to ${status} payment`, {
//         position: "top-center",
//         autoClose: 2000,
//       });
//     }
//   };

//   const filteredPayments = payments.filter(payment => {
//     if (filter !== 'all' && payment.paymentStatus !== filter) return false;
//     if (!searchQuery) return true;
    
//     const queryLower = searchQuery.toLowerCase();
//     return (
//       payment.userName?.toLowerCase().includes(queryLower) ||
//       payment.expertName?.toLowerCase().includes(queryLower) ||
//       payment.verificationCode?.toLowerCase().includes(queryLower) ||
//       payment.amount?.toString().includes(queryLower)
//     );
//   });

//   const statusCounts = payments.reduce((acc, payment) => {
//     acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + 1;
//     return acc;
//   }, {});

//   if (loading && payments.length === 0) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
//           <p className="text-gray-600">Loading payments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <header className="sticky top-0 z-10 bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <button
//               onClick={() => navigate('/adminportal')}
//               className="flex items-center text-orange-600 hover:text-orange-800 transition-colors"
//             >
//               <FiArrowLeft className="w-5 h-5 mr-2" />
//               <span className="text-lg font-semibold">Back to Dashboard</span>
//             </button>
//             <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage User Payments</h1>
//             <div className="w-32"></div>
//           </div>
//         </div>
//       </header>

//       <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Filters and Stats Section */}
//         <div className="mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             {/* Search Box */}
//             <div className="bg-white rounded-xl shadow-sm p-4">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiSearch className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
//                   placeholder="Search by user, expert, amount..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Status Filter */}
//             <div className="bg-white rounded-xl shadow-sm p-4">
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
//                 <div className="grid grid-cols-4 gap-2">
//                   <button
//                     onClick={() => setFilter('all')}
//                     className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     All ({payments.length})
//                   </button>
//                   <button
//                     onClick={() => setFilter('pending')}
//                     className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     Pending ({statusCounts.pending || 0})
//                   </button>
//                   <button
//                     onClick={() => setFilter('accepted')}
//                     className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     Accepted ({statusCounts.accepted || 0})
//                   </button>
//                   <button
//                     onClick={() => setFilter('rejected')}
//                     className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     Rejected ({statusCounts.rejected || 0})
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center">
//               <div className="bg-blue-100 p-3 rounded-full mr-4">
//                 <FiDollarSign className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Total Payments</p>
//                 <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
//               </div>
//             </div>
//             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center">
//               <div className="bg-yellow-100 p-3 rounded-full mr-4">
//                 <FaUserClock className="w-6 h-6 text-yellow-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Pending</p>
//                 <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
//               </div>
//             </div>
//             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center">
//               <div className="bg-green-100 p-3 rounded-full mr-4">
//                 <FaUserCheck className="w-6 h-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Accepted</p>
//                 <p className="text-2xl font-bold text-gray-900">{statusCounts.accepted || 0}</p>
//               </div>
//             </div>
//             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center">
//               <div className="bg-red-100 p-3 rounded-full mr-4">
//                 <FiX className="w-6 h-6 text-red-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Rejected</p>
//                 <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected || 0}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payments Table - Non-scrolling version */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           {/* Desktop Table */}
//           <div className="hidden md:block">
//             <table className="w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Expert</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Code</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Proof</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredPayments.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
//                       No payments found matching your criteria
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredPayments.map((payment) => (
//                     <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
//                             <FiUser className="w-5 h-5 text-orange-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-semibold text-gray-900">{payment.userName || 'Anonymous'}</div>
//                             {/* <div className="text-xs text-gray-500 truncate">{payment.userId}</div> */}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                             <FaUserTie className="w-5 h-5 text-blue-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-semibold text-gray-900">{payment.expertName || 'Expert'}</div>
//                             {/* <div className="text-xs text-gray-500 truncate">{payment.expertId}</div> */}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm font-bold text-gray-900">
//                         Rs. {payment.amount || '0'}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded">
//                           {payment.verificationCode || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         {payment.screenshotUrl ? (
//                           <button
//                             onClick={() => setSelectedPayment(payment)}
//                             className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium hover:bg-indigo-200 transition-colors"
//                           >
//                             <FiEye className="mr-1" /> View
//                           </button>
//                         ) : (
//                           <span className="text-xs text-gray-500">No proof</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                           payment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {payment.paymentStatus?.charAt(0).toUpperCase() + payment.paymentStatus?.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         <div className="flex items-center">
//                           <FiClock className="mr-1 text-gray-400" />
//                           {new Date(payment.timestamp?.toDate() || new Date()).toLocaleDateString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-right text-sm font-medium">
//                         {payment.paymentStatus === 'pending' ? (
//                           <div className="flex space-x-2 justify-end">
//                             <button
//                               onClick={() => updatePaymentStatus(payment.id, 'accepted')}
//                               className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors flex items-center"
//                             >
//                               <FiCheck className="mr-1" /> Accept
//                             </button>
//                             <button
//                               onClick={() => updatePaymentStatus(payment.id, 'rejected')}
//                               className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
//                             >
//                               <FiX className="mr-1" /> Reject
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-gray-400 italic">Verified</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Cards */}
//           <div className="md:hidden space-y-4 p-4">
//             {filteredPayments.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No payments found matching your criteria
//               </div>
//             ) : (
//               filteredPayments.map((payment) => (
//                 <div key={payment.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
//                           <FiUser className="w-5 h-5 text-orange-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900">{payment.userName || 'Anonymous'}</h3>
//                           <p className="text-xs text-gray-500">To: {payment.expertName || 'Expert'}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                       payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                       payment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {payment.paymentStatus?.charAt(0).toUpperCase() + payment.paymentStatus?.slice(1)}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-3">
//                     <div>
//                       <p className="text-xs text-gray-500">Amount</p>
//                       <p className="font-bold text-gray-900">Rs. {payment.amount || '0'}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Verification Code</p>
//                       <p className="font-mono text-sm text-gray-900">{payment.verificationCode || 'N/A'}</p>
//                     </div>
//                   </div>

//                   <div className="flex justify-between items-center pt-3 border-t border-gray-100">
//                     {payment.screenshotUrl ? (
//                       <button
//                         onClick={() => setSelectedPayment(payment)}
//                         className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
//                       >
//                         <FiEye className="mr-1" /> View Proof
//                       </button>
//                     ) : (
//                       <span className="text-sm text-gray-400">No proof</span>
//                     )}

//                     {payment.paymentStatus === 'pending' ? (
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => updatePaymentStatus(payment.id, 'accepted')}
//                           className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors flex items-center"
//                         >
//                           <FiCheck className="mr-1" /> Accept
//                         </button>
//                         <button
//                           onClick={() => updatePaymentStatus(payment.id, 'rejected')}
//                           className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors flex items-center"
//                         >
//                           <FiX className="mr-1" /> Reject
//                         </button>
//                       </div>
//                     ) : (
//                       <span className="text-xs text-gray-500">Verified</span>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Payment Proof Modal */}
//         {selectedPayment?.screenshotUrl && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//     {/* Glassmorphism Card */}
//     <div className="bg-white/95 backdrop-blur-lg rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl border border-white/20">
      
//       {/* Modern Header */}
//       <div className="p-6 border-b border-white/10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Payment Verification
//               </span>
//             </h2>
//             <div className="flex items-center gap-3 mt-2">
//               <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                 selectedPayment.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
//                 selectedPayment.paymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
//                 'bg-red-100 text-red-800'
//               }`}>
//                 {selectedPayment.paymentStatus?.toUpperCase()}
//               </span>
//               <span className="text-sm text-gray-500">
//                 #{selectedPayment.verificationCode || 'N/A'}
//               </span>
//             </div>
//           </div>
//           <button 
//             onClick={() => setSelectedPayment(null)}
//             className="p-2 rounded-full hover:bg-gray-100/50 transition-all"
//           >
//             <FiX className="w-5 h-5 text-gray-500 hover:text-gray-700" />
//           </button>
//         </div>
//       </div>

//       {/* Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
//         {/* Payment Proof - Floating Panel */}
//         <div className="p-6 lg:border-r border-white/10">
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300"></div>
//             <div className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-medium text-gray-700">Payment Receipt</h3>
//                 <button
//                   onClick={() => {
//                     const link = document.createElement('a');
//                     link.href = selectedPayment.screenshotUrl;
//                     link.download = `payment_${selectedPayment.verificationCode || selectedPayment.id}.jpg`;
//                     link.click();
//                   }}
//                   className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
//                 >
//                   <FiDownload className="mr-1.5" /> Download
//                 </button>
//               </div>
//               <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden h-64">
//                 <img
//                   src={selectedPayment.screenshotUrl}
//                   alt="Payment proof"
//                   className="max-h-full max-w-full object-contain"
//                   onError={(e) => {
//                     e.target.src = '/payment-error-placeholder.svg';
//                     e.target.className = 'h-40 object-contain opacity-40';
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Transaction Details - Card Stack */}
//         <div className="p-6 space-y-6">
//           {/* Amount Card */}
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm font-medium text-blue-800">Total Amount</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">
//                   Rs. {selectedPayment.amount?.toLocaleString() || '0'}
//                 </p>
//               </div>
//               <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-blue-700 border border-blue-200">
//                 {selectedPayment.paymentMethod || 'Unknown'}
//               </div>
//             </div>
//           </div>

//           {/* User Cards */}
//           <div className="grid grid-cols-1 gap-4">
//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
//               <div className="flex items-center">
//                 <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                   <FiUser className="text-blue-600 w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500">Customer</p>
//                   <p className="font-medium text-gray-900">{selectedPayment.userName || 'Anonymous'}</p>
//                   <p className="text-xs text-gray-500 mt-1 truncate">{selectedPayment.userId}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
//               <div className="flex items-center">
//                 <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                   <FaUserTie className="text-purple-600 w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500">Expert</p>
//                   <p className="font-medium text-gray-900">{selectedPayment.expertName || 'Unknown'}</p>
//                   <p className="text-xs text-gray-500 mt-1 truncate">{selectedPayment.expertId}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Date & Actions */}
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-xs font-medium text-gray-500">Submitted</p>
//                 <p className="text-sm">
//                   {new Date(selectedPayment.timestamp?.toDate() || new Date())
//                     .toLocaleDateString('en-US', {
//                       month: 'short',
//                       day: 'numeric',
//                       year: 'numeric'
//                     })}
//                 </p>
//               </div>
//               {selectedPayment.verifiedAt && (
//                 <div>
//                   <p className="text-xs font-medium text-gray-500">Verified</p>
//                   <p className="text-sm">
//                     {new Date(selectedPayment.verifiedAt)
//                       .toLocaleDateString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         year: 'numeric'
//                       })}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {selectedPayment.paymentStatus === 'pending' && (
//               <div className="grid grid-cols-2 gap-3 pt-2">
//                 <button
//                   onClick={() => {
//                     updatePaymentStatus(selectedPayment.id, 'rejected');
//                     setSelectedPayment(null);
//                   }}
//                   className="px-4 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
//                 >
//                   <FiX className="w-5 h-5" />
//                   Reject
//                 </button>
//                 <button
//                   onClick={() => {
//                     updatePaymentStatus(selectedPayment.id, 'accepted');
//                     setSelectedPayment(null);
//                   }}
//                   className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
//                 >
//                   <FiCheck className="w-5 h-5" />
//                   Approve
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-200/50 text-xs text-gray-500">
//         <div className="flex justify-between">
//           <span>Booking ID: {selectedPayment.bookingId || 'N/A'}</span>
//           <span>System Ref: {selectedPayment.id}</span>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//       </main>
//     </div>
//   );
// };

// export default ManageUsersPayment;