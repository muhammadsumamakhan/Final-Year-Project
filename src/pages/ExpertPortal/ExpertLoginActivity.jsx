import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase/config'; // Ensure this path is correct for your project
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const ExpertLoginActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const logAndFetchActivity = async () => {
      try {
        const user = auth.currentUser;
        console.log("User:", user); // Debug: Check if user is authenticated

        if (user) {
          // Query to check if the user is an expert
          const expertQuery = query(
            collection(db, "FYPusers"),
            where("uid", "==", user.uid),
            where("role", "==", "expert")
          );

          const expertSnapshot = await getDocs(expertQuery);
          console.log("Expert Snapshot:", expertSnapshot); // Debug: Check if expert data is found

          if (!expertSnapshot.empty) {
            console.log("User is an expert, adding log...");

            // Add a new login log to Firestore
            await addDoc(collection(db, "logs"), {
              uid: user.uid,
              role: "expert",
              loginStatus: "Logged In",
              date: serverTimestamp()
            })
              .then(() => {
                console.log("Login log added for expert");
              })
              .catch((error) => {
                console.error("Error adding login log: ", error);
                setError("An error occurred while logging in.");
              });

            // Fetch logs for this expert
            const logsQuery = query(
              collection(db, "logs"),
              where("uid", "==", user.uid),
              orderBy("date", "desc") // Ensure "date" is indexed
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
              setError("No logs found for this expert.");
            }
          } else {
            setError('User is not an expert');
            console.log("User is not an expert.");
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

      {logs.length === 0 ? (
        <p>No logs found for this expert.</p>
      ) : (
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
                  {log.role === "expert" ? "Expert" : "Unknown Role"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpertLoginActivity;
