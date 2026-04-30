import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import About from './pages/About';
import Signup from './pages/Signup';
import Home from './pages/Home'; 
import Contact from './pages/Contact';
import Profile from './pages/Profile';

// Protect Dashboard Route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [isDark, setIsDark] = useState(false);
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // TODO: Replace with valid ID

  return (
    <GoogleOAuthProvider clientId="137298023096-vuq0un51074prlhsgu4h04l7t3q2ssmi.apps.googleusercontent.com">
    <AuthProvider>
      <Router>
        {/* Navbar visible on all pages, gets dark-mode state */}
        <Navbar isDark={isDark} setIsDark={setIsDark} />

        <div className={isDark ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen'}>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Home isDark={isDark} />} />

            {/* Auth pages */}
            <Route path="/login" element={<Login isDark={isDark} />} />
            <Route path="/signup"  element={<Signup isDark={isDark}/>} />

            {/* About, Contact, Profile */}
            <Route path="/about" element={<About isDark={isDark} />} />
            <Route path="/contact" element={<Contact isDark={isDark} />} />
            <Route path="/profile" element={
                <PrivateRoute>
                    <Profile isDark={isDark} setIsDark={setIsDark} />
                </PrivateRoute>
            } />

            {/* Dashboard (protected) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard isDark={isDark} />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

