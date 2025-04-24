import React, { useEffect, useState } from 'react';
import { auth } from '../../config/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase/config';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserDetails(currentUser.uid);
        
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserDetails = async (uid) => {
    try {
      const q = query(collection(db, 'FYPusers'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
    
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserDetails(doc.data());
        });
      } else {
        setError('User details not found.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details.');
    }
  };
  

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!user) return <div className="text-center mt-10 text-gray-600">Please log in to view your profile</div>;

  return (
    <>
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">My Profile</h1>
      </header>

      <div className="container mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Profile Info */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center">
            <img
              src={
                userDetails?.photoURL || user?.photoURL || 'https://via.placeholder.com/100'
              }
              alt="User"
              className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
            />

            <h2 className="text-2xl font-semibold mt-4">
              {userDetails?.fullName || user?.displayName || 'User Name'}
            </h2>

            <hr className="w-full my-6 border-gray-300" />

            {/* Contact Info */}
            <div className="w-full space-y-4">
              <h3 className="font-semibold text-gray-500 uppercase text-sm">Contact Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Email: </span>
                  <a href={`mailto:${user?.email}`} className="text-blue-500 hover:underline">
                    {user?.email}
                  </a>
                </p>
                <p><span className="font-semibold">Phone:</span> {userDetails?.contact || 'Not provided'}</p>
                <p><span className="font-semibold">Address:</span> {userDetails?.address || 'Not provided'}</p>
                <p><span className="font-semibold">CNIC:</span> {userDetails?.cnic || 'Not provided'}</p>
              </div>

              <hr className="my-6 border-gray-300" />

              {/* Account Info */}
              <h3 className="font-semibold text-gray-500 uppercase text-sm">Account Information</h3>
              <div>
                <p>
                  <span className="font-semibold">Account Created: </span>
                  {userDetails?.createdAt?.toDate
                    ? userDetails.createdAt.toDate().toLocaleString()
                    : 'Not available'}
                </p>
              </div>
            </div>

            <button className="mt-8 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Booking Activity */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">My Booking Activity</h2>
          <ul className="space-y-4">
            {[1, 2, 3].map((booking, index) => (
              <li key={index} className="border-b pb-3">
                <p><span className="font-semibold">Service:</span> Laptop Repair</p>
                <p><span className="font-semibold">Expert:</span> John Doe</p>
                <p><span className="font-semibold">Date:</span> 2025-04-22</p>
                <button className="text-red-500 hover:underline mt-1">Cancel Booking</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
