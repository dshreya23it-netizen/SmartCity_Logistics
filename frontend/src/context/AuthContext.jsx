import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import emailService from '../services/emailService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStep, setVerificationStep] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Sign up with OTP verification
  const signup = async (email, password, name) => {
    try {
      console.log('Starting signup process for:', email);
      
      // Step 1: Send OTP
      const otpResult = await emailService.sendOTPEmail(email, name);
      
      if (otpResult.success) {
        setPendingUser({ email, password, name });
        setVerificationStep('otp_sent');
        setOtpSent(true);
        
        // Store OTP in context for verification
        localStorage.setItem('pending_signup', JSON.stringify({
          email,
          password,
          name,
          otp: otpResult.otp
        }));
        
        return {
          success: true,
          step: 'otp_sent',
          message: 'OTP sent to your email'
        };
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Verify OTP and complete signup
  const verifyOTPAndSignup = async (email, otp) => {
    try {
      const otpResult = emailService.verifyOTP(email, otp);
      
      if (otpResult.success) {
        // Get pending user data
        const pendingData = JSON.parse(localStorage.getItem('pending_signup') || '{}');
        
        if (pendingData.email !== email) {
          throw new Error('Email mismatch');
        }
        
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          pendingData.email, 
          pendingData.password
        );
        
        // Send welcome email
        await emailService.sendWelcomeEmail(pendingData.email, pendingData.name);
        
        // Clear pending data
        localStorage.removeItem('pending_signup');
        setVerificationStep(null);
        setPendingUser(null);
        setEmailVerified(true);
        
        return {
          success: true,
          user: userCredential.user,
          message: 'Account created successfully!'
        };
      } else {
        throw new Error(otpResult.message);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Login with OTP verification
  const login = async (email, password) => {
    try {
      // First check if user exists and send OTP
      const otpResult = await emailService.sendOTPEmail(email, email.split('@')[0]);
      
      if (otpResult.success) {
        setPendingUser({ email, password });
        setVerificationStep('login_otp_sent');
        setOtpSent(true);
        
        localStorage.setItem('pending_login', JSON.stringify({
          email,
          password,
          otp: otpResult.otp
        }));
        
        return {
          success: true,
          step: 'otp_sent',
          message: 'OTP sent to your email for verification'
        };
      }
    } catch (error) {
      console.error('Login OTP error:', error);
      throw error;
    }
  };

  // Verify OTP and complete login
  const verifyOTPAndLogin = async (email, otp) => {
    try {
      const otpResult = emailService.verifyOTP(email, otp);
      
      if (otpResult.success) {
        const pendingData = JSON.parse(localStorage.getItem('pending_login') || '{}');
        
        if (pendingData.email !== email) {
          throw new Error('Email mismatch');
        }
        
        // Sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          pendingData.email, 
          pendingData.password
        );
        
        // Clear pending data
        localStorage.removeItem('pending_login');
        setVerificationStep(null);
        setPendingUser(null);
        setEmailVerified(true);
        
        return {
          success: true,
          user: userCredential.user,
          message: 'Login successful!'
        };
      } else {
        throw new Error(otpResult.message);
      }
    } catch (error) {
      console.error('Login OTP verification error:', error);
      throw error;
    }
  };

  // Resend OTP
  const resendOTP = async (email, name) => {
    try {
      const otpResult = await emailService.sendOTPEmail(email, name || email.split('@')[0]);
      
      if (otpResult.success) {
        return {
          success: true,
          message: 'New OTP sent to your email'
        };
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  };

  // Send payment confirmation email
  const sendPaymentEmail = async (email, name, orderDetails) => {
    try {
      const result = await emailService.sendPaymentConfirmationEmail(email, name, orderDetails);
      return result;
    } catch (error) {
      console.error('Payment email error:', error);
      return { success: false, error: error.message };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      const result = await emailService.sendPasswordResetEmail(email, email.split('@')[0]);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Get sent emails (for admin view)
  const getSentEmails = () => {
    return emailService.getSentEmails();
  };

  // Clear verification states
  const clearVerification = () => {
    setVerificationStep(null);
    setPendingUser(null);
    setOtpSent(false);
    localStorage.removeItem('pending_signup');
    localStorage.removeItem('pending_login');
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    verifyOTPAndSignup,
    login,
    verifyOTPAndLogin,
    resendOTP,
    logout: () => signOut(auth),
    resetPassword,
    sendPaymentEmail,
    getSentEmails,
    verificationStep,
    pendingUser,
    otpSent,
    emailVerified,
    clearVerification,
    setEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};