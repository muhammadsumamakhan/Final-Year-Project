import React, { useEffect, useState } from 'react';
import { auth } from '../../config/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase/config';

const ExpertProfile = () => {
  const [user, setUser] = useState(null);
  const [expertDetails, setExpertDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchExpertDetails(currentUser.uid);
      } else {
        setUser(null);
        setExpertDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchExpertDetails = async (uid) => {
    try {
      const q = query(collection(db, 'FYPusers'), where('uid', '==', uid), where('role', '==', 'expert'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setExpertDetails(doc.data());
        });
      } else {
        setError('Expert details not found.');
      }
    } catch (error) {
      console.error('Error fetching expert details:', error);
      setError('Failed to load expert details.');
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!user) return <div className="text-center mt-10 text-gray-600">Please log in to view your profile</div>;

  return (
    <>
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Expert Profile</h1>
      </header>

      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gray-100">
        {/* Profile Info */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center">
            <img
              src={expertDetails?.profileUrl || user?.photoURL || 'https://via.placeholder.com/100'}
              alt="Expert"
              className="w-48 h-48 object-cover border-4 border-orange-400 shadow"
            />
            <h2 className="text-2xl font-semibold mt-4 text-center">
              {expertDetails?.fullName || user?.displayName || 'Expert Name'}
            </h2>

            <hr className="w-full my-6 border-gray-300" />

            {/* Expertise Info */}
            <div className="w-full space-y-4">
              <h3 className="font-semibold text-gray-500 uppercase text-sm">Expert Information</h3>
              <div className="space-y-2 text-sm md:text-base">
                <p><span className="font-semibold">Email:</span> {expertDetails?.email || user?.email}</p>
                <p><span className="font-semibold">Expertise:</span> {expertDetails?.specialization || 'Not specified'}</p>
                <p><span className="font-semibold">Experience:</span> {expertDetails?.experience || 'Not available'}</p>
                <p><span className="font-semibold">Phone:</span> {expertDetails?.phone || 'Not provided'}</p>
                <p><span className="font-semibold">Address:</span> {expertDetails?.address || 'Not provided'}</p>
                <p><span className="font-semibold">Services Offered:</span> {expertDetails?.serviceArea || 'Not listed'}</p>
                <p><span className="font-semibold">Skills:</span> {expertDetails?.skills || 'Not listed'}</p>
                <p><span className="font-semibold">Languages:</span> {expertDetails?.languages || 'Not listed'}</p>
              </div>

              <hr className="my-6 border-gray-300" />

              {/* Account Info */}
              <h3 className="font-semibold text-gray-500 uppercase text-sm">Account Information</h3>
              <div className="space-y-2 text-sm md:text-base">
                <p>
                  <span className="font-semibold">Account Created:</span>{' '}
                  {expertDetails?.createdAt?.toDate
                    ? expertDetails.createdAt.toDate().toLocaleString()
                    : 'Not available'}
                </p>
                <p><span className="font-semibold">National ID:</span> {expertDetails?.nationalId || 'Not available'}</p>
                {expertDetails?.nationalIdUrl && (
                  <p>
                    <span className="font-semibold">ID Proof: </span>
                    <a
                      href={expertDetails.nationalIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Document
                    </a>
                  </p>
                )}
              </div>
            </div>

            <button className="mt-8 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              Edit Profile
            </button>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default ExpertProfile;
