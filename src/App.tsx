import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CredentialsCheck from './components/auth/CredentialsCheck';
import OAuthCallback from './components/auth/OAuthCallback';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/check-credentials" element={
            <ProtectedRoute>
              <CredentialsCheck />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
