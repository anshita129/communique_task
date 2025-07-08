import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import "./App.css"

function AuthPage({ onLogin, onBack }) {
  const [registrationDone, setRegistrationDone] = useState(false);

  const handleRegister = () => {
    setRegistrationDone(true);
    alert('Registration Done!');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Register</h2>
          {!registrationDone ? (
            <RegisterForm onRegister={handleRegister} />
          ) : (
            <div>
              <p style={{ color: '#43a047', textAlign: 'center', fontSize: '1.1rem' }}>
                ✓ Registration Successful!
              </p>
              <p style={{ textAlign: 'center', color: '#666' }}>
                You can now login using the form on the right.
              </p>
            </div>
          )}
        </div>
        
        <div className="auth-right">
          <h2>Login</h2>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
      
      <button className="back-btn" onClick={onBack} style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px' 
      }}>
        ← Back to Home
      </button>
    </div>
  );
}

export default AuthPage;
