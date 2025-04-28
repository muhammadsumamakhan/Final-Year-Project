import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase/config'; // Ensure this path is correct for your project
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const UserLoginActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const logAndFetchActivity = async () => {
      try {
        const user = auth.currentUser;
        console.log("User:", user); // Debug: Check if user is authenticated

        if (user) {
          // Query to check if the user is a user
          const userQuery = query(
            collection(db, "FYPusers"),
            where("uid", "==", user.uid),
            where("role", "==", "user")
          );

          const userSnapshot = await getDocs(userQuery);
          console.log("User Snapshot:", userSnapshot); // Debug: Check if user data is found

          if (!userSnapshot.empty) {
            console.log("User found, adding log...");

            // Add a new login log to Firestore
            await addDoc(collection(db, "logs"), {
              uid: user.uid,
              role: "user",
              loginStatus: "Logged In",
              date: serverTimestamp()
            })
              .then(() => {
                console.log("Login log added for user");
              })
              .catch((error) => {
                console.error("Error adding login log: ", error);
                setError("An error occurred while logging in.");
              });

            // Fetch logs for this user
            const logsQuery = query(
              collection(db, "logs"),
              where("uid", "==", user.uid),
              orderBy("date", "desc") // Ensure "date" is indexed in Firestore
            );

            const logsSnapshot = await getDocs(logsQuery);
            console.log("Logs Snapshot:", logsSnapshot); // Debug: Check if logs are fetched

            if (!logsSnapshot.empty) {
              const logsData = logsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setLogs(logsData); // Set the logs state
            } else {
              setError("No logs found for this user.");
            }
          } else {
            setError('User is not found or not a user.');
            console.log("User is not found or not a user.");
          }
        } else {
          setError('No user logged in');
          console.log("No user logged in.");
        }
      } catch (err) {
        console.error("Error fetching or adding log:", err);
        setError('An error occurred while fetching logs');
      } finally {
        setLoading(false); // Stop loading after operation is completed
      }
    };

    logAndFetchActivity();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {loading && <p>Loading your activity...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <p>No logs found for this user.</p>
      )}

      {!loading && logs.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#3498db", color: "#fff" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>LOGIN STATUS</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>DATE</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>USER TYPE</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ backgroundColor: "#f9f9f9", textAlign: "center" }}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{log.loginStatus}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {log.date ? new Date(log.date.seconds * 1000).toLocaleString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                  }) : "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {log.role === "user" ? "User" : "Unknown Role"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserLoginActivity;
