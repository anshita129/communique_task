import React, { useState } from 'react';
import CandidateForm from './components/CandidateForm';
import AuthPage from './AuthPage';
import CandidateList from './CandidateList';
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'auth', 'list'


  const handleViewList = () => {
    setCurrentPage('auth');
  };

  const handleLogin = () => {
 
    setCurrentPage('list');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');

    setCurrentPage('home');
  };

  // Home page - Candidate form + View List button
  if (currentPage === 'home') {
    return (
      <div className="App">
        <h1>Candidate Submission</h1>
        <CandidateForm />
        <button className="view-list-btn" onClick={handleViewList}>
          View Complete List
        </button>
      </div>
    );
  }

  // Auth page - Register and Login side by side
  if (currentPage === 'auth') {
    return (
      <AuthPage 
        onLogin={handleLogin} 
        onBack={handleBackToHome}
      />
    );
  }

  // List page - Show candidate list
  if (currentPage === 'list') {
    return (
      <CandidateList
        onBack={handleBackToHome}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;
