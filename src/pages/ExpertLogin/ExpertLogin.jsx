import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../config/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

const ExpertLogin = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    // Get values from input fields
    const expertEmail = emailRef.current.value.trim();
    const expertPassword = passwordRef.current.value.trim();

    // Validation
    if (!expertEmail || !expertPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, expertEmail, expertPassword);
      const user = userCredential.user;

      // Fetch expert role from Firestore
      const expertDoc = await getDoc(doc(db, "FYPusers", user.uid));
      if (expertDoc.exists()) {
        console.log("User Role:", expertDoc.data().role);
      }

      toast.success("Login successful!");
      setTimeout(() => {
        // Redirect to Expert Portal after successful login
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Login Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-[30rem]">
        {/* Orange Text */}
        <h2 className="text-orange-500 text-3xl mr-4 text-center">
          Welcome, Expert!
        </h2>
        <h1 className="text-3xl font-bold mb-8 text-center">Expert Login</h1>

        {/* Input Fields */}
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              ref={emailRef}
              className="w-full p-4 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                ref={passwordRef}
                className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#0D003B] text-white p-3 rounded hover:bg-orange-600 transition duration-200 mb-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/expertregister" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </div>
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer />
    </div>
  );
};

export default ExpertLogin;