import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase/config";

const StatCard = ({ title, count, description }) => (
  <div className="bg-white shadow-md p-6 rounded-lg text-center hover:scale-105 transition-transform">
    <h3 className="text-xl font-bold text-gray-700">{title}</h3>
    <p className="mt-2 text-2xl font-bold text-orange-500">{count}</p>
    <p className="text-gray-500">{description}</p>
  </div>
);

const AdminPortal = () => {
  const [customerCount, setCustomerCount] = useState(0);
  const [expertCount, setExpertCount] = useState(0);
  const [quizRequestCount, setQuizRequestCount] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCounts = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "FYPusers"));
      const allUsers = userSnapshot.docs.map((doc) => doc.data());

      const customerOnlyCount = allUsers.filter((u) => u.role === "user").length;
      const expertOnlyCount = allUsers.filter((u) => u.role === "expert").length;

      setCustomerCount(customerOnlyCount);
      setExpertCount(expertOnlyCount);

      const quizSnapshot = await getDocs(collection(db, "ExpertQuiz"));
      setQuizRequestCount(quizSnapshot.size);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchCounts();

    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stats = [
    { title: "Customers", count: customerCount, description: "Active Customers" },
    { title: "Experts", count: expertCount, description: "Active Experts" },
    { title: "Experts Request", count: quizRequestCount, description: "Active Experts Requests" },
  ];

  const sidebarLinks = [
    { name: "Manage Customers", path: "/admin-manage-users" },
    { name: "Manage Experts", path: "/admin-manage-experts" },
    { name: "Manage Experts Request", path: "/admin-manage-experts-request" },
    { name: "Manage Customers Payment", path: "/admin-manage-payments" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Admin Portal</h1>
        <button
          className="block md:hidden p-2 bg-white text-orange-500 rounded"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-full sm:w-1/4 bg-white shadow-lg p-6 fixed sm:relative z-20 sm:z-0">
            <nav>
              <ul className="space-y-4">
                {sidebarLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `text-lg ${
                          isActive
                            ? "text-orange-500 font-bold"
                            : "text-gray-700 hover:text-orange-500"
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-lg text-gray-700 hover:text-red-500"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-6 sm:ml-1/4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Welcome, Admin!
          </h2>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                count={stat.count}
                description={stat.description}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
