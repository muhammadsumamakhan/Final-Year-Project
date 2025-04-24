import React, { useState, useEffect } from "react";

function ExpertOrder() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const fakeOrders = [
        {
          id: 1,
          name: "Order #101",
          status: "Pending",
          details: "Laptop Repair",
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

  const handleAccept = (orderId) => {
    alert(`Accepted Order #${orderId}`);
  };

  const handleDelete = (orderId) => {
    alert(`Deleted Order #${orderId}`);
  };

  return (
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
                    <p className="text-gray-500">{order.details}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(order.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Accept
                  </button>
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
  );
}

export default ExpertOrder;
