import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageExperts = () => {

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);


  useEffect(() => {
    const fetchOrders = async () => {
      const fakeOrders = [
        {
          id: 1,
          name: "jhon",
          status: "active",
          image: "https://via.placeholder.com/50",
        },
        {
          id: 2,
          name: "Order #102",
          status: "Completed",
          details: "Software Installation",
          image: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "Order #103",
          status: "In Progress",
          details: "System Upgrade",
          image: "https://via.placeholder.com/50",
        },
      ];
      setTimeout(() => setOrders(fakeOrders), 1000);
    };

    fetchOrders();
  }, []);


  


  return (
    <div>
      {/* Header */}
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
          Manage Experts
        </button>
      </header>

      <div className="p-6">
        {/* Orders Section */}
        <div className="max-w-xl mx-auto">
          {orders.length === 0 ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="w-full p-4 bg-white rounded-lg shadow-lg flex justify-between items-center hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.image}
                      alt={order.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{order.name}</h2>
                      {/* Conditionally render the details if available */}
                      {order.details && <p className="text-gray-500">{order.details}</p>}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageExperts