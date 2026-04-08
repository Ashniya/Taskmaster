


import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/auth`;
const CONTACT_URL = `${BASE_URL}/api/contact`;

export const login = async (email, password) => {
  return await axios.post(`${API_URL}/login`, { email, password });
};

// Google Login
export const googleLogin = async (token) => {
  return await axios.post(`${API_URL}/google-login`, { token });
};

// Signup (OTP step 1)
export const signup = async (name, email) => {
  return await axios.post(`${API_URL}/signup`, { name, email });
};

// Verify signup (OTP + password)
export const verifySignup = async (name, email, otp, password) => {
  return await axios.post(`${API_URL}/verify-signup`, {
    name,
    email,
    otp,
    password,
  });
};

// Forgot password
export const forgotPassword = async (email) => {
  return await axios.post(`${API_URL}/forgot-password`, { email });
};

// Reset password
export const resetPassword = async (email, otp, newPassword) => {
  return await axios.post(`${API_URL}/reset-password`, {
    email,
    otp,
    newPassword,
  });
};

// Contact form
export const sendContactMessage = async (payload) => {
  return await axios.post(CONTACT_URL, payload);
};
