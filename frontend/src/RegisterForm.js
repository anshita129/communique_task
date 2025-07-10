import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const COMMUNIQUE_CODE = process.env.COMMUNIQUE_CODE;


function RegisterForm({ onRegister }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', communiqueCode: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check communique code before proceeding
    if (form.communiqueCode !== COMMUNIQUE_CODE) {
      alert('Invalid communique code. Please enter the correct code to register.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/register`, {
        username: form.username,
        password: form.password,
        email: form.email
      });
      onRegister(); // Show success message or proceed
    } catch (error) {
      alert('Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        style={{
          padding: '16px 18px',
          border: '1px solid #d0d0d0',
          borderRadius: '6px',
          fontSize: '1.1rem',
          outline: 'none',
          background: '#e6f7f7'
        }}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{
          padding: '16px 18px',
          border: '1px solid #d0d0d0',
          borderRadius: '6px',
          fontSize: '1.1rem',
          outline: 'none',
          background: '#e6f7f7'
        }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        style={{
          padding: '16px 18px',
          border: '1px solid #d0d0d0',
          borderRadius: '6px',
          fontSize: '1.1rem',
          outline: 'none',
          background: '#e6f7f7'
        }}
      />
      <input
        name="communiqueCode"
        type="password"
        placeholder="Communique Code"
        value={form.communiqueCode}
        onChange={handleChange}
        required
        style={{
          padding: '16px 18px',
          border: '1px solid #d0d0d0',
          borderRadius: '6px',
          fontSize: '1.1rem',
          outline: 'none',
          background: '#e6f7f7'
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 40px',
          background: 'linear-gradient(90deg, #ffb75e 0%, #ed2f6a 100%)',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: '600',
          border: 'none',
          borderRadius: '999px',
          cursor: 'pointer',
          minHeight: '44px',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export default RegisterForm;
