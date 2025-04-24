import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../config/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const ExpertRegister = () => {
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const genderRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [specialization, setSpecialization] = useState("");
  const experienceRef = useRef(null);
  const [certificationUrl, setCertificationUrl] = useState("");
  const skillsRef = useRef(null);
  const languagesRef = useRef(null);
  const cityRef = useRef(null);
  const serviceAreaRef = useRef(null);
  const chargesRef = useRef(null);
  const nationalIdRef = useRef(null);
  const [nationalIdUrl, setNationalIdUrl] = useState("");
  const linkedInRef = useRef(null);
  const githubInRef = useRef(null);
  const [userRole, setUserRole] = useState("");

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Cloudinary Upload Widget Function
  const openUploadWidget = (field) => {
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
          if (field === "profile") {
            setProfileUrl(result.info.secure_url);
          } else if (field === "certification") {
            setCertificationUrl(result.info.secure_url);
          } else if (field === "nationalId") {
            setNationalIdUrl(result.info.secure_url);
          }
          toast.success("Image uploaded successfully!");
        } else if (error) {
          console.error("Upload Error:", error);
          toast.error("Image upload failed!");
        }
      }
    );
    myWidget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract form values
    const expertFullName = fullNameRef.current.value.trim();
    const expertEmail = emailRef.current.value.trim();
    const expertPhone = phoneRef.current.value.trim();
    const expertAddress = addressRef.current.value.trim();
    const expertGender = genderRef.current.value.trim();
    const expertPassword = passwordRef.current.value.trim();
    const expertConfirmPassword = confirmPasswordRef.current.value.trim();
    const expertSpecialization = specialization.trim(); 
    const expertExperience = experienceRef.current.value.trim();
    const expertSkills = skillsRef.current.value.trim();
    const expertLanguages = languagesRef.current.value.trim();
    const expertCity = cityRef.current.value.trim();
    const expertServiceArea = serviceAreaRef.current.value.trim();
    const expertCharges = chargesRef.current.value.trim();
    const expertNationalId = nationalIdRef.current.value.trim();
    const expertLinkedIn = linkedInRef.current.value.trim();
    const expertGithub = githubInRef.current.value.trim();

    // Mandatory fields check
    if (
      !expertFullName ||
      !expertEmail ||
      !expertPhone ||
      !expertAddress ||
      !expertGender ||
      !expertPassword ||
      !specialization ||
      !expertConfirmPassword ||
      !expertExperience ||
      !expertSkills ||
      !expertLanguages ||
      !expertCity ||
      !expertServiceArea ||
      !expertCharges ||
      !userRole ||
      !expertNationalId
    ) {
      toast.error("All fields are required.");
      return false;
    }

    // Password validation
    if (expertPassword.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(expertPassword)) {
      toast.error("Password must be at least 6 characters long and include at least one special character (e.g., !@#$%^&*).");
      return false;
    }
    if (expertPassword !== expertConfirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    // CNIC Validation (Pakistan Format)
    const cnicPattern = /^\d{5}-\d{7}-\d$/;
    if (!cnicPattern.test(expertNationalId)) {
      toast.error("Invalid CNIC format. Please enter your CNIC in the format XXXXX-XXXXXXX-X (e.g., 42101-1234567-1).");
      return false;
    }

    // Phone Number Validation (Pakistan Format)
    const phonePattern = /^03\d{2}-\d{7}$/;
    if (!phonePattern.test(expertPhone)) {
      toast.error("Invalid phone number format. Please use the format: 03XX-XXXXXXX (e.g., 0300-1234567).");
      return false;
    }

    // Profile & National ID Image Validation
    if (!profileUrl) {
      toast.warning("Profile image is required. Please click the 'Upload Image' button to add a profile picture.");
      return false;
    }
    if (!nationalIdUrl) {
      toast.warning("National ID image is required for verification. Please click the 'Upload Image' button to add a valid National ID or Passport.");
      return false;
    }

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        expertEmail,
        expertPassword
      );
      const user = userCredential.user;

      // Step 2: Update user profile with display name and photo URL
      await updateProfile(user, {
        displayName: expertFullName,
        photoURL: profileUrl,
      });

      // Step 3: Store additional expert details in Firestore
      const expertData = {
        uid: userCredential.user.uid,
        fullName: expertFullName,
        email: expertEmail,
        phone: expertPhone,
        address: expertAddress,
        gender: expertGender,
        specialization: expertSpecialization,
        experience: expertExperience,
        skills: expertSkills,
        languages: expertLanguages,
        city: expertCity,
        serviceArea: expertServiceArea,
        charges: expertCharges,
        nationalId: expertNationalId,
        nationalIdUrl,
        linkedIn: expertLinkedIn || "none",
        github: expertGithub || "none",
        certificationUrl: certificationUrl || "none",
        role: userRole,
        profileUrl,
        createdAt: new Date(),
      };

      // Add expert data to Firestore
      await addDoc(collection(db, "FYPusers"), expertData);

      // Step 4: Sign out the user immediately after registration
      await signOut(auth);
      toast.success("Registration successful! You can now log in.");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white mt-10 mb-10 p-10 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Expert Registration</h1>
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input ref={fullNameRef} type="text" placeholder="John Doe" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-gray-700">Email Address</label>
              <input ref={emailRef} type="email" placeholder="johndoe@example.com" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input ref={phoneRef} type="tel" placeholder="03XX-XXXXXXX" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-gray-700">Address</label>
              <input ref={addressRef} type="text" placeholder="123 Main St, City, Country" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-gray-700">Gender</label>
              <select ref={genderRef} className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Profile Image
              </label>
              <button
                type="button"
                onClick={() => openUploadWidget("profile")}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 bg-white text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Upload Image
              </button>
            </div>

            {/* Expert Role Dropdown */}
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
              <option value="expert">Expert</option>
            </select>
          </div>

            {/* Password Field with Toggle */}
            <div>
              <label className="block text-gray-700">Password</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            {/* Confirm Password Field with Toggle */}
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <h2 className="text-2xl font-semibold mt-12 mb-6">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialization Dropdown */}
            <div>
              <label className="block text-gray-700">Specialization</label>
              <select
                className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">Select Specialization</option>
                <option value="Hardware Repair">Hardware Repair</option>
                <option value="Software Troubleshooting">Software Troubleshooting</option>
                <option value="Networking">Networking</option>
                <option value="Data Recovery">Data Recovery</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Show input field when "Other" is selected */}
            {specialization === "other" && (
              <div>
                <label className="block text-gray-700">Specify Other Specialization</label>
                <input
            
                  type="text"
                  placeholder="Enter your specialization"
                  className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
            <div>
              <label className="block text-gray-700">Experience Level</label>
              <select ref={experienceRef} className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Experience Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
                <option>5+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Certifications (optional)
              </label>
              <button
                type="button"
                onClick={() => openUploadWidget("certification")}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 bg-white text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Upload Image
              </button>
            </div>
            <div>
              <label className="block text-gray-700">Skills</label>
              <input ref={skillsRef} type="text" placeholder="Skills (comma-separated)" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-gray-700">Languages Spoken</label>
              <select ref={languagesRef} className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Languages Spoken</option>
                <option>English</option>
                <option>Urdu</option>
                <option>Both English / Urdu</option>
              </select>
            </div>
          </div>

          {/* Location & Availability */}
          <h2 className="text-2xl font-semibold mt-12 mb-6 text-gray-800">Location & Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City/Location Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">City/Location</label>
              <input
                ref={cityRef}
                type="text"
                placeholder="Enter your city or location"
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* Service Area Dropdown */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Service Area</label>
              <select ref={serviceAreaRef} className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition">
                <option value="" disabled selected>Select service area</option>
                <option>Remote</option>
                <option>On-site</option>
                <option>Both Remote / On-site</option>
              </select>
            </div>

            {/* Service Charges Input */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Service Charges</label>
              <input
                ref={chargesRef}
                type="text"
                placeholder="Enter service charges (e.g., hourly rate)"
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          {/* Verification & Authentication */}
          <h2 className="text-2xl font-semibold mt-12 mb-6">Verification & Authentication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700">National ID/Passport Number</label>
              <input ref={nationalIdRef} type="text" placeholder="42101-1234567-1" className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                Upload National ID/Passport
              </label>
              <button
                type="button"
                onClick={() => openUploadWidget("nationalId")}
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500 bg-white text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Upload Image
              </button>
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">LinkedIn Profile (Optional)</label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition">
                <span className="pl-4 text-gray-500">linkedin.com/in/</span>
                <input
                  ref={linkedInRef}
                  type="text"
                  placeholder="yourusername"
                  className="w-full p-4 pl-1 focus:outline-none"
                />
              </div>
            </div>

            {/* GitHub Profile */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">GitHub Profile (Optional)</label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition">
                <span className="pl-4 text-gray-500">github.com/</span>
                <input
                  ref={githubInRef}
                  type="text"
                  placeholder="yourusername"
                  className="w-full p-4 pl-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="mt-4 w-full py-3 bg-[#0D003B] text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300">
            Register
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/expertlogin" className="text-blue-500 hover:underline">Login</Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ExpertRegister;