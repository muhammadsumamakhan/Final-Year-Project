import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../config/firebase/config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserLogin = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userEmail = emailRef.current.value.trim();
    const userPassword = passwordRef.current.value;

    if (!userEmail || !userPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Admin Login Check
      if (userEmail === "admin@gmail.com" && userPassword === "SSUET211@") {
        toast.success("Admin login successful!");
        setTimeout(() => {
          navigate("/adminportal");
        }, 1500);
        return;
      }

      // Regular User Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
      const user = userCredential.user;

      // Verify user role from Firestore (FYPusers collection)
      const q = query(
        collection(db, "FYPusers"),
        where("uid", "==", user.uid),
        where("role", "==", "user")
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User with role "user" found
        console.log("User verified with role 'user'.");

        // Add login record to "logs" collection
        await addDoc(collection(db, "logs"), {
          uid: user.uid,
          role: "user",
          loginStatus: "Logged In",
          date: serverTimestamp(),
        });

        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error("Unauthorized user or role mismatch.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Login Error:", error.code, error.message);

      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No user found with this email.");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Try again later.");
          break;
        default:
          toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Login Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-[30rem]">
        {/* Welcome Text */}
        <h2 className="text-orange-500 text-3xl mr-4 text-center">
          Welcome, User!
        </h2>
        <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

        {/* Input Fields */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              ref={emailRef}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                ref={passwordRef}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D003B] text-white p-3 rounded hover:bg-orange-600 transition duration-200 mb-4"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">Don't have an account?</p>
          <button className="text-blue-500 hover:underline">
            <Link to="/UserRegister">Register here</Link>
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserLogin;
