import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidateList.css'; // Ensure your CSS includes .back-btn styling

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function CandidateList({ onBack, onLogout }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(res.data);
      } catch (error) {
        alert('Failed to fetch candidates. Are you logged in?');
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  return (
    <div className="candidate-list-container">
      {/* Top bar with export and navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <button
            className="export-btn"
            onClick={() => window.open(`${BACKEND_URL}/api/candidates/export/csv`, '_blank')}
          >
            Export as CSV
          </button>
          <button
            className="export-btn"
            onClick={() => window.open(`${BACKEND_URL}/api/candidates/export/pdf`, '_blank')}
          >
            Export as PDF
          </button>
        </div>
        <div>
          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
          <button className="back-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Candidate table or loading/empty state */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="no-candidates">
          <p>No candidates found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Google Drive Link</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.roll_number}</td>
                  <td>
                    <a
                      href={c.google_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="drive-link"
                    >
                      View Document
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CandidateList;
