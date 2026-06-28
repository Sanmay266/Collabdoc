import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const message = await register(name, email, password);
      setSuccess(`${message}! Redirecting to sign in...`);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container scrollable-y flex-col align-center justify-between fade-in" style={{ padding: "60px 24px" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div className="card" style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          
          <h1 style={{ fontSize: "3.5rem", marginBottom: "8px", fontFamily: "var(--font-serif)" }}>Join CollabDoc</h1>
          <p className="mb-8" style={{ fontSize: "1.05rem", letterSpacing: "0.02em" }}>Create an account to start writing.</p>

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

          {success && (
            <div style={{
              padding: "12px",
              border: "1px solid #cce8cf",
              backgroundColor: "#f2faf3",
              color: "#276a30",
              fontSize: "0.9rem",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                className="form-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

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
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 500, borderBottom: "1px solid var(--text-primary)" }}>
              Sign in instead
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