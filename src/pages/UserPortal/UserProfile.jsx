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

  if (loading) {
    return (
      <div className="p-10 max-w-xl mx-auto">
        <div className="animate-pulse space-y-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto" />
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (error)
    return <div className="text-center mt-10 text-red-600 font-medium">{error}</div>;

  if (!user)
    return (
      <div className="text-center mt-10 text-gray-600 font-medium">
        Please log in to view your profile
      </div>
    );

  return (
    <>
      <header className="w-full h-[70px] flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-16 lg:px-36 shadow">
        <h1 className="text-white text-2xl md:text-3xl font-bold">My Profile</h1>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-gray-50 text-gray-800 rounded-2xl shadow-md p-6 md:p-10 max-w-3xl mx-auto transition duration-300 hover:shadow-lg">
          <div className="flex flex-col items-center text-center">
            <img
              src={
                userDetails?.photoURL ||
                user?.photoURL ||
                'https://via.placeholder.com/100'
              }
              alt="User"
              className="w-48 h-48 object-cover border-4 border-orange-400 shadow"
            />

            <h2 className="text-2xl font-semibold mt-4 text-gray-800">
              {userDetails?.fullName || user?.displayName || 'User Name'}
            </h2>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-orange-500 uppercase text-sm">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Email:</span>{' '}
                <a href={`mailto:${user?.email}`} className="text-blue-500 hover:underline">
                  {user?.email}
                </a>
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{' '}
                {userDetails?.contact || 'Not provided'}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{' '}
                {userDetails?.address || 'Not provided'}
              </p>
              <p>
                <span className="font-semibold">CNIC:</span>{' '}
                {userDetails?.cnic || 'Not provided'}
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-orange-500 uppercase text-sm">Account Information</h3>
            <p className="text-gray-700">
              <span className="font-semibold">Account Created:</span>{' '}
              {userDetails?.createdAt?.toDate
                ? userDetails.createdAt.toDate().toLocaleString()
                : 'Not available'}
            </p>
          </div>

          <div className="text-center">
            <button className="mt-8 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-md hover:shadow-lg transition duration-300 ease-in-out">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
