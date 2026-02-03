import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { doc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database, firestore } from "../firebase";
import emailService from "../services/emailService"; // Import email service
import "./Signup.css"; // Optional: Create CSS file

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    organization: "",
    city: "",
    department: "",
    adminCode: "",
    adminDepartment: "",
    adminLevel: "level1"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Clear expired OTPs on component mount
  useEffect(() => {
    emailService.clearExpiredOTPs();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError("");
    
    // Step 1: Basic info validation
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (!formData.email.includes('@')) {
        setError("Please enter a valid email address");
        return;
      }
    }
    
    // Step 2: Role selection
    if (step === 2 && !formData.role) {
      setError("Please select a role");
      return;
    }
    
    // Step 3: OTP Verification
    if (step === 3) {
      if (!otpSent) {
        // Send OTP
        await sendOTP();
        return;
      }
      // If OTP is sent but not verified, don't proceed
      if (!otpVerified) {
        setError("Please verify your email with OTP first");
        return;
      }
    }
    
    // Step 4: Complete profile
    if (step === 4 && formData.role === "admin" && formData.adminCode !== "admin123") {
      setError("Invalid admin access code. Use 'admin123' for testing.");
      return;
    }
    
    if (step === 4 && formData.role === "user") {
      if (!formData.city || !formData.department) {
        setError("Please fill in all user information fields");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 4 && otpSent && !otpVerified) {
      // Keep OTP status when going back from profile completion
      setStep(step - 1);
    } else if (step === 3 && otpSent) {
      // Reset OTP if going back from OTP step
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(["", "", "", "", "", ""]);
      setStep(step - 1);
    } else {
      setStep(step - 1);
    }
    setError("");
  };

  // Send OTP to email
  const sendOTP = async () => {
    setError("");
    setOtpLoading(true);
    
    try {
      const result = await emailService.sendOTPEmail(formData.email, formData.name);
      
      if (result.success) {
        setOtpSent(true);
        setSuccess(true);
        setError(""); // Clear any previous errors
        console.log("OTP sent successfully:", result.message);
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
      console.error("OTP sending error:", error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    
    setOtpLoading(true);
    setError("");
    
    try {
      const result = await emailService.verifyOTP(formData.email, otpString);
      
      if (result.success) {
        setOtpVerified(true);
        setSuccess(true);
        setError("");
        console.log("OTP verified successfully");
        
        // Auto-proceed to next step after verification
        setTimeout(() => {
          setStep(4); // Go to profile completion
        }, 1000);
      } else {
        setError(result.message);
        setSuccess(false);
      }
    } catch (error) {
      setError("OTP verification failed");
      console.error("OTP verification error:", error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setError("");
    setOtpLoading(true);
    setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
    
    try {
      const result = await emailService.resendOTP(formData.email);
      
      if (result.success) {
        setSuccess(true);
        setError("New OTP sent to your email");
        console.log("OTP resent successfully");
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Failed to resend OTP");
      console.error("Resend OTP error:", error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Main signup function (now step 4)
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Final validation
    if (!otpVerified) {
      setError("Email must be verified before signup");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Starting signup process...");
      console.log("🔍 User role:", formData.role);
      console.log("🔍 Verified email:", formData.email);
      
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      console.log("✅ User created in Auth:", user.email);
      console.log("✅ User UID:", user.uid);
      
      // 2. Save to Firestore
      console.log("🔄 Saving user data to Firestore...");
      
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        role: formData.role,
        displayName: formData.name,
        emailVerified: true, // Mark as verified via OTP
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active"
      };
      
      // Add role-specific data
      if (formData.role === "user") {
        userData.organization = formData.organization || "";
        userData.city = formData.city || "";
        userData.department = formData.department || "";
      } else if (formData.role === "admin") {
        userData.adminDepartment = formData.adminDepartment;
        userData.adminLevel = formData.adminLevel;
        userData.permissions = {
          canManageSensors: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageOrders: true,
          canManageProducts: true
        };
      }
      
      console.log("📝 User data to save:", userData);
      
      // Save to Firestore
      await setDoc(doc(firestore, "users", user.uid), userData);
      console.log(`✅ User data saved to Firestore with role: ${formData.role}`);
      
      // 3. Save to Realtime Database
      try {
        const rtUserRef = ref(database, `users/${user.uid}`);
        const rtUserData = {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          role: formData.role,
          emailVerified: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active"
        };
        
        await set(rtUserRef, rtUserData);
        console.log("✅ User data also saved to Realtime Database");
        
        // Create user's shopping cart and orders
        const cartRef = ref(database, `users/${user.uid}/cart`);
        await set(cartRef, {});
        
        const ordersRef = ref(database, `users/${user.uid}/orders`);
        await set(ordersRef, {});
        console.log("✅ Cart and orders created");
      } catch (dbError) {
        console.warn("⚠️ Realtime Database error:", dbError.message);
      }
      
      // 4. Store in localStorage
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userRole", formData.role);
      
      setSuccess(true);
      setLoading(false);
      
      // 5. Show success message and redirect
      alert(`✅ ${formData.role === 'admin' ? '👑 Admin' : '👤 User'} account created successfully! Please login.`);
      navigate("/login");

    } catch (error) {
      setLoading(false);
      console.error("❌ SIGNUP ERROR:", error.code, error.message);
      
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please login instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError("Signup failed: " + error.message);
      }
    }
  };

  // Update progress steps to include OTP verification
  const progressSteps = ["Basic Info", "Select Role", "Verify Email", "Complete Profile"];
  
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1rem"
    }}>
      <div style={{maxWidth: "500px", width: "100%", margin: "0 auto"}}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          {/* Logo */}
          <div style={{textAlign: "center", marginBottom: "1.5rem"}}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "800",
              color: "#1a237e",
              marginBottom: "0.5rem"
            }}>
              SmartCity LOGISTICS
            </h1>
            <p style={{color: "#666", fontSize: "0.9rem"}}>Create Your Account</p>
          </div>

          {/* Progress Bar */}
          <div style={{marginBottom: "2rem"}}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              position: "relative",
              marginBottom: "1rem"
            }}>
              {progressSteps.map((stepName, index) => (
                <div key={index} style={{textAlign: "center", zIndex: 2}}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: index + 1 <= step ? "#3d5afe" : "#e0e0e0",
                    color: index + 1 <= step ? "white" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    margin: "0 auto",
                    border: `3px solid ${index + 1 <= step ? "#3d5afe" : "#e0e0e0"}`
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    fontWeight: step === index + 1 ? "bold" : "normal",
                    color: step === index + 1 ? "#3d5afe" : "#666"
                  }}>
                    {stepName}
                  </div>
                </div>
              ))}
              <div style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                height: "3px",
                background: "#e0e0e0",
                zIndex: 1
              }}>
                <div style={{
                  width: `${((step - 1) / (progressSteps.length - 1)) * 100}%`,
                  height: "100%",
                  background: "#3d5afe",
                  transition: "width 0.3s ease"
                }}></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: "10px",
              borderLeft: "4px solid #f44336",
              fontSize: "0.9rem"
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Success Message */}
          {success && !error && (
            <div style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              background: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: "10px",
              borderLeft: "4px solid #4caf50",
              fontSize: "0.9rem"
            }}>
              {otpVerified ? "✅ Email verified successfully!" : "✅ OTP sent to your email!"}
            </div>
          )}

          <form onSubmit={step === 4 ? handleSignup : handleNextStep}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div style={{marginBottom: "1rem"}}>
                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box",
                      transition: "border 0.3s"
                    }}
                  />
                </div>

                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box",
                      transition: "border 0.3s"
                    }}
                  />
                </div>

                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min. 6 characters"
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div style={{marginBottom: "1rem"}}>
                <p style={{color: "#666", marginBottom: "2rem", fontSize: "1rem"}}>
                  Select your role to continue. This determines what features you can access.
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.5rem",
                  marginBottom: "2rem"
                }}>
                  {/* User Option */}
                  <div
                    onClick={() => handleChange({ target: { name: "role", value: "user" } })}
                    style={{
                      padding: "1.5rem",
                      border: `3px solid ${formData.role === "user" ? "#3d5afe" : "#e0e0e0"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: formData.role === "user" ? "#f5f7ff" : "white",
                      textAlign: "center",
                      transition: "all 0.3s",
                      boxShadow: formData.role === "user" ? "0 5px 15px rgba(61, 90, 254, 0.2)" : "none"
                    }}
                  >
                    <div style={{
                      fontSize: "2.5rem",
                      marginBottom: "1rem",
                      background: formData.role === "user" ? "#3d5afe" : "#f0f0f0",
                      color: formData.role === "user" ? "white" : "#999",
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto"
                    }}>
                      👤
                    </div>
                    <h3 style={{marginBottom: "0.5rem", color: "#333"}}>User</h3>
                    <p style={{color: "#666", fontSize: "0.9rem", lineHeight: "1.4"}}>
                      Access shopping, sensors, and user dashboard
                    </p>
                  </div>
                  
                  {/* Admin Option */}
                  <div
                    onClick={() => handleChange({ target: { name: "role", value: "admin" } })}
                    style={{
                      padding: "1.5rem",
                      border: `3px solid ${formData.role === "admin" ? "#3d5afe" : "#e0e0e0"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: formData.role === "admin" ? "#f5f7ff" : "white",
                      textAlign: "center",
                      transition: "all 0.3s",
                      boxShadow: formData.role === "admin" ? "0 5px 15px rgba(61, 90, 254, 0.2)" : "none"
                    }}
                  >
                    <div style={{
                      fontSize: "2.5rem",
                      marginBottom: "1rem",
                      background: formData.role === "admin" ? "#3d5afe" : "#f0f0f0",
                      color: formData.role === "admin" ? "white" : "#999",
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto"
                    }}>
                      👑
                    </div>
                    <h3 style={{marginBottom: "0.5rem", color: "#333"}}>Administrator</h3>
                    <p style={{color: "#666", fontSize: "0.9rem", lineHeight: "1.4"}}>
                      Manage products, users, and system settings
                    </p>
                  </div>
                </div>
                
                <div style={{
                  padding: "1rem",
                  background: "#e8f4ff",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  color: "#0066cc",
                  textAlign: "center"
                }}>
                  <strong>Note:</strong> Admin access code: <code style={{
                    background: "#d1e7ff",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontFamily: "monospace"
                  }}>admin123</code> (for testing)
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div style={{marginBottom: "1rem"}}>
                <div style={{
                  textAlign: "center",
                  marginBottom: "2rem",
                  padding: "1rem",
                  background: "#f0f8ff",
                  borderRadius: "10px"
                }}>
                  <h3 style={{color: "#1a237e", marginBottom: "0.5rem"}}>
                    {otpVerified ? "✅ Email Verified" : "Verify Your Email"}
                  </h3>
                  <p style={{color: "#555"}}>
                    We'll send a 6-digit code to <strong>{formData.email}</strong>
                  </p>
                </div>

                {!otpSent ? (
                  <div style={{textAlign: "center"}}>
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpLoading}
                      style={{
                        padding: "1rem 2rem",
                        background: otpLoading ? "#999" : "#3d5afe",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: otpLoading ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        width: "100%",
                        marginBottom: "1rem"
                      }}
                    >
                      {otpLoading ? "Sending OTP..." : "Send OTP to Email"}
                    </button>
                    
                    <p style={{color: "#666", fontSize: "0.9rem"}}>
                      🔒 This helps us ensure your email is valid and secure.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* OTP Input */}
                    <div style={{marginBottom: "2rem"}}>
                      <p style={{textAlign: "center", color: "#555", marginBottom: "1rem"}}>
                        Enter the 6-digit code sent to your email
                      </p>
                      
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginBottom: "1rem"
                      }}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            style={{
                              width: "50px",
                              height: "60px",
                              border: `2px solid ${otpVerified ? "#4caf50" : "#ddd"}`,
                              borderRadius: "8px",
                              fontSize: "24px",
                              textAlign: "center",
                              fontWeight: "bold",
                              background: otpVerified ? "#f0fff0" : "white"
                            }}
                            disabled={otpVerified || otpLoading}
                          />
                        ))}
                      </div>
                      
                      {!otpVerified && (
                        <div style={{textAlign: "center"}}>
                          <button
                            type="button"
                            onClick={verifyOTP}
                            disabled={otpLoading || otp.join('').length !== 6}
                            style={{
                              padding: "0.8rem 2rem",
                              background: otpLoading || otp.join('').length !== 6 ? "#ccc" : "#4caf50",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: otpLoading || otp.join('').length !== 6 ? "not-allowed" : "pointer",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              marginBottom: "1rem"
                            }}
                          >
                            {otpLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                          
                          <div style={{marginTop: "1rem"}}>
                            <p style={{color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem"}}>
                              Didn't receive the code?
                            </p>
                            <button
                              type="button"
                              onClick={resendOTP}
                              disabled={otpLoading}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#3d5afe",
                                cursor: otpLoading ? "not-allowed" : "pointer",
                                textDecoration: "underline",
                                fontSize: "0.9rem"
                              }}
                            >
                              Resend OTP
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {otpVerified && (
                        <div style={{
                          textAlign: "center",
                          padding: "1rem",
                          background: "#e8f5e9",
                          borderRadius: "8px",
                          marginTop: "1rem"
                        }}>
                          <p style={{color: "#2e7d32", fontWeight: "bold"}}>
                            ✅ Email verified successfully!
                          </p>
                          <p style={{color: "#555", fontSize: "0.9rem"}}>
                            Proceeding to complete your profile...
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Additional Information */}
            {step === 4 && formData.role === "user" && (
              <div style={{marginBottom: "1rem"}}>
                <div style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f0f8ff",
                  borderRadius: "10px"
                }}>
                  <h3 style={{color: "#1a237e", marginBottom: "0.5rem"}}>
                    Complete Your Profile
                  </h3>
                  <p style={{color: "#555", fontSize: "0.9rem"}}>
                    ✅ Email verified: <strong>{formData.email}</strong>
                  </p>
                </div>
                
                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Enter your organization name"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter your city"
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        background: "white",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="">Select Department</option>
                      <option value="logistics">Logistics</option>
                      <option value="operations">Operations</option>
                      <option value="management">Management</option>
                      <option value="technical">Technical</option>
                      <option value="purchasing">Purchasing</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && formData.role === "admin" && (
              <div style={{marginBottom: "1rem"}}>
                <div style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f0f8ff",
                  borderRadius: "10px"
                }}>
                  <h3 style={{color: "#1a237e", marginBottom: "0.5rem"}}>
                    Complete Admin Profile
                  </h3>
                  <p style={{color: "#555", fontSize: "0.9rem"}}>
                    ✅ Email verified: <strong>{formData.email}</strong>
                  </p>
                </div>
                
                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                    Admin Access Code *
                  </label>
                  <input
                    type="password"
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    required
                    placeholder="Enter 'admin123' for testing"
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                  <p style={{marginTop: "0.5rem", fontSize: "0.85rem", color: "#666"}}>
                    For testing purposes, use: <code style={{
                      background: "#f0f0f0",
                      padding: "0.2rem 0.4rem",
                      borderRadius: "4px",
                      fontFamily: "monospace"
                    }}>admin123</code>
                  </p>
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      Admin Department
                    </label>
                    <select
                      name="adminDepartment"
                      value={formData.adminDepartment}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        background: "white",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="">Select Department</option>
                      <option value="product_management">Product Management</option>
                      <option value="user_management">User Management</option>
                      <option value="order_management">Order Management</option>
                      <option value="system_admin">System Administration</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500"}}>
                      Admin Level
                    </label>
                    <select
                      name="adminLevel"
                      value={formData.adminLevel}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        background: "white",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="level1">Level 1 (Basic)</option>
                      <option value="level2">Level 2 (Intermediate)</option>
                      <option value="level3">Level 3 (Advanced)</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: "flex",
              gap: "1rem",
              marginTop: "2rem"
            }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading || otpLoading}
                  style={{
                    padding: "1rem 1.5rem",
                    background: "#f5f5f5",
                    color: "#333",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading || otpLoading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    transition: "all 0.3s",
                    flex: 1
                  }}
                  onMouseOver={(e) => !loading && !otpLoading && (e.target.style.background = "#e0e0e0")}
                  onMouseOut={(e) => !loading && !otpLoading && (e.target.style.background = "#f5f5f5")}
                >
                  ← Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || (step === 3 && !otpVerified)}
                style={{
                  flex: loading ? 1 : (step === 1 ? 1 : 2),
                  padding: "1rem",
                  background: loading ? "#999" : 
                    (step === 3 && !otpVerified) ? "#ccc" : 
                    "linear-gradient(45deg, #3d5afe, #2979ff)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  transition: "all 0.3s",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(61, 90, 254, 0.3)"
                }}
                onMouseOver={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => !loading && (e.target.style.transform = "translateY(0)")}
              >
                {loading ? (
                  <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"}}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    Creating Account...
                  </div>
                ) : step === 4 ? "Create Account" : 
                   step === 3 && !otpSent ? "Send OTP" : 
                   step === 3 && otpSent && !otpVerified ? "Verify OTP First" : 
                   "Next →"}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div style={{textAlign: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #eee"}}>
            <p style={{color: "#666", fontSize: "0.95rem"}}>
              Already have an account?{" "}
              <a 
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                style={{
                  color: "#3d5afe",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          outline: none;
          border-color: #3d5afe !important;
          box-shadow: 0 0 0 3px rgba(61, 90, 254, 0.1) !important;
        }
      `}</style>
    </div>
  );
}