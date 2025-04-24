import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../config/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const UserRegister = () => {
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const contactRef = useRef(null);
  const cnicRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const addressRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState("");

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
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Upload Success:", result.info);
          setImageUrl(result.info.secure_url);
          toast.success("Image uploaded successfully!");
        } else if (error) {
          console.error("Upload Error:", error);
          toast.error("Image upload failed!");
        }
      }
    );
    myWidget.open();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userFullName = fullNameRef.current.value.trim();
    const userEmail = emailRef.current.value.trim();
    const userContact = contactRef.current.value.trim();
    const userCNIC = cnicRef.current.value.trim();
    const userPassword = passwordRef.current.value;
    const userConfirmPassword = confirmPasswordRef.current.value;
    const userAddress = addressRef.current.value.trim();

    // Validation checks
    if (userPassword !== userConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (userPassword.length < 6) {
      toast.error("Password should be at least 6 characters long");
      return;
    }

    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharPattern.test(userPassword)) {
      toast.error("Password should include at least one special character");
      return;
    }

    const cnicPattern = /^\d{5}-\d{7}-\d$/;
    if (!cnicPattern.test(userCNIC)) {
      toast.error("Invalid CNIC format. Use 42101-1234567-1");
      return;
    }

    const phonePattern = /^\d{4}-\d{7}$/;
    if (!phonePattern.test(userContact)) {
      toast.error("Invalid contact format. Use 0300-1234567");
      return;
    }

    if (!imageUrl) {
      toast.warning("Please upload a profile image.");
      return;
    }

    if (!userRole) {
      toast.warning("Please select a role.");
      return;
    }

    try {
      // Create user with email and password
      const userSignUp = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      console.log("User created successfully:", userSignUp);

      // Update user profile with display name and photo URL
      await updateProfile(userSignUp.user, {
        displayName: userFullName,
        photoURL: imageUrl,
      });

      // Save additional user details in Firestore
      const userDocRef = collection(db, "FYPusers");
      await addDoc(userDocRef, {
        uid: userSignUp.user.uid,
        fullName: userFullName,
        email: userEmail,
        contact: userContact,
        cnic: userCNIC,
        address: userAddress,
        photoURL: imageUrl,
        role: userRole,
        createdAt: new Date(),
      });

      // **Sign out the user immediately after registration**
      await signOut(auth);
      toast.success("Registration successful! Please log in to continue.");
      

    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white mt-10 mb-10 p-10 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          User Registration
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Full Name
              </label>
              <input
                ref={fullNameRef}
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="johndoe@example.com"
                required
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Contact
              </label>
              <input
                ref={contactRef}
                type="tel"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="0300-1234567"
                required
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                CNIC
              </label>
              <input
                ref={cnicRef}
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="42101-1234567-1"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="fm123$$$"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600">
                Confirm Password
              </label>
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="fm123$$$"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-11 text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600">
                Address
              </label>
              <input
                ref={addressRef}
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="123 Main St, City, Country"
                required
              />
            </div>
          </div>

          {/* User Role Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Select Role
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
              required
            >
              <option value="" disabled>
                Choose a role
              </option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Your Image
            </label>
            <button
              type="button"
              onClick={openUploadWidget}
              className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 bg-white text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Upload Image
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0D003B] text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300"
          >
            Register
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/UserLogin" className="text-blue-500 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserRegister;