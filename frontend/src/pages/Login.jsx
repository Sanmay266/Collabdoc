import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { saveToken } from "../utils/token";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = await login(email, password);

      console.log("TOKEN:", token);

      saveToken(token);
      // Store user details in localStorage for UI greeting (fallback from email input)
      const namePart = email.split("@")[0];
      const friendlyName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      localStorage.setItem("collabdoc_user_profile", JSON.stringify({ name: friendlyName, email }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container scrollable-y flex-col align-center justify-between fade-in" style={{ padding: "60px 24px" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div className="card" style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          
          <h1 style={{ fontSize: "3.8rem", marginBottom: "8px", fontFamily: "var(--font-serif)" }}>CollabDoc</h1>
          <p className="mb-8" style={{ fontSize: "1.05rem", letterSpacing: "0.02em" }}>A space for quiet writing and collaboration.</p>

          {error && (
            <div style={{
              padding: "12px",
              border: "1px solid #e5c0b0",
              backgroundColor: "#faf2ee",
              color: "#b04020",
              fontSize: "0.9rem",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                className="form-input"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <input
                id="password-input"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              className="btn btn-primary mt-4"
              type="submit"
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 500, borderBottom: "1px solid var(--text-primary)" }}>
              Create one here
            </Link>
          </div>

        </div>
      </div>
      
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        © {new Date().getFullYear()} CollabDoc • Minimalist Design
      </div>
    </div>
  );
}
