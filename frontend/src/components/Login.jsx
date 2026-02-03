import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Attempting login with:", email);
      
      // Sign out first to clear any previous session
      if (auth.currentUser) {
        console.log("Found existing user, signing out first:", auth.currentUser.email);
        await auth.signOut();
      }
      
      // Now attempt login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Firebase login successful:", user.email);
      
      // Store email for remember me
      localStorage.setItem("userEmail", email);
      
      setLoading(false);
      
      // Force hard refresh to trigger AuthContext update
      console.log("🔄 Forcing page reload to update auth state...");
      window.location.href = "/";
      
    } catch (err) {
      setLoading(false);
      console.error("❌ Login error:", err.code);
      
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found. Please sign up first.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format");
          break;
        default:
          setError("Login failed: " + err.message);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "white",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{textAlign: "center", marginBottom: "2rem"}}>
          <h1 style={{color: "#1a237e", marginBottom: "0.5rem"}}>
            SmartCity Login
          </h1>
          <p style={{color: "#666"}}>
            Enter your credentials to continue
          </p>
        </div>

        {error && (
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "8px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom: "1rem"}}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: "100%",
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{marginBottom: "1.5rem"}}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: "100%",
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading ? "#666" : "#3d5afe",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              marginBottom: "1rem",
              transition: "background 0.3s"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={{textAlign: "center"}}>
            <p style={{color: "#666", fontSize: "0.9rem"}}>
              Don't have an account?{" "}
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
                style={{color: "#3d5afe", fontWeight: "bold", textDecoration: "none"}}
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}