import React, { useState } from 'react';
import axios from 'axios';
import "./CandidateForm.css"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


function CandidateForm() {
  const [form, setForm] = useState({ name: '', rollNumber: '', googleDriveLink: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Regex patterns for validation
  const nameRegex = /^[A-Za-z\s]+$/;
  const rollRegex = /^\d{2}[A-Z]{2}\d{5}$/;
  const driveRegex = /^https:\/\/drive\.google\.com\//;

  const validate = () => {
    const newErrors = {};
    if (!nameRegex.test(form.name)) {
      newErrors.name = "Name must contain only alphabets and spaces.";
    }
    if (!rollRegex.test(form.rollNumber)) {
      newErrors.rollNumber = "Roll number must be in the format 24CS10081 (2 digits, 2 uppercase letters, 5 digits).";
    }
    if (!driveRegex.test(form.googleDriveLink)) {
      newErrors.googleDriveLink = "Google Drive link must be a valid write link.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined }); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(false);
    const minDuration = 1000;
    const start = Date.now();
    try {
      const payload = {
        name: form.name,
        roll_number: form.rollNumber,
        google_drive_link: form.googleDriveLink
      };
      await axios.post(`${BACKEND_URL}/api/candidates`, payload);
      setForm({ name: '', rollNumber: '', googleDriveLink: '' });
      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1000);
      }, Math.max(0, minDuration - elapsed));
    } catch (error) {
      setLoading(false);
      alert('Submission failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      {errors.name && <p className="error">{errors.name}</p>}

      <input
        name="rollNumber"
        placeholder="Roll Number"
        value={form.rollNumber}
        onChange={handleChange}
        required
      />
      {errors.rollNumber && <p className="error">{errors.rollNumber}</p>}

      <input
        name="googleDriveLink"
        placeholder="Google Drive Link"
        value={form.googleDriveLink}
        onChange={handleChange}
        required
      />
      {errors.googleDriveLink && <p className="error">{errors.googleDriveLink}</p>}

      <button
        type="submit"
        className={loading ? 'loading' : ''}
        disabled={loading || success}
      >
        {loading ? (
          <span className="spinner"></span>
        ) : success ? (
          <span className="tick">&#10003;</span>
        ) : (
          'Submit'
        )}
      </button>
      {loading && <p>Submitting, please wait...</p>}
    </form>
  );
}

export default CandidateForm;
