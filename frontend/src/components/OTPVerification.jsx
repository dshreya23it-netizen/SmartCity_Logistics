import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OTPVerification.css';

const OTPVerification = ({ 
  email, 
  name, 
  type = 'signup', 
  onVerified, 
  onResend, 
  onCancel 
}) => {
  const { verifyOTPAndSignup, verifyOTPAndLogin, resendOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (type === 'signup') {
        result = await verifyOTPAndSignup(email, otpString);
      } else {
        result = await verifyOTPAndLogin(email, otpString);
      }

      if (result.success) {
        setSuccess('Verification successful!');
        setTimeout(() => {
          onVerified(result);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await resendOTP(email, name);
      if (result.success) {
        setSuccess('New OTP sent to your email');
        setResendCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <div className="otp-header">
          <div className="otp-icon">🔐</div>
          <h2>Email Verification</h2>
          <p className="otp-subtitle">
            Enter the 6-digit code sent to<br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="otp-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="otp-success">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-digit"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="verify-btn"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>

        <div className="otp-footer">
          <p className="otp-help">
            Didn't receive the code?<br />
            <button
              type="button"
              className="resend-link"
              onClick={handleResendOTP}
              disabled={!canResend || loading}
            >
              {canResend ? 'Resend OTP' : `Resend in ${resendCountdown}s`}
            </button>
          </p>

          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Use Different Email
          </button>

          <div className="otp-note">
            <p>📧 Check your spam folder if you don't see the email</p>
            <p>⏳ OTP expires in 10 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;