import { Link } from "react-router-dom";
import { getToken } from "../utils/token";

export default function NotFound() {
  const hasToken = !!getToken();

  return (
    <div className="app-container scrollable-y flex-col align-center justify-between fade-in" style={{ padding: "100px 24px" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div className="card" style={{ width: "100%", maxWidth: "460px", textAlign: "center", padding: "48px 32px" }}>
          
          <h1 style={{ fontSize: "5rem", fontFamily: "var(--font-serif)", marginBottom: "16px", lineHeight: 1 }}>404</h1>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.4rem", fontWeight: "500", marginBottom: "16px", color: "var(--text-primary)" }}>
            Page Not Found
          </h2>
          <p style={{ marginBottom: "32px", fontSize: "0.95rem" }}>
            The workspace or route you are searching for is unavailable, has been deleted, or resides elsewhere.
          </p>

          <Link 
            to={hasToken ? "/dashboard" : "/login"} 
            className="btn btn-primary"
            style={{ display: "inline-flex" }}
          >
            {hasToken ? "Back to Workspace" : "Back to Sign In"}
          </Link>

        </div>
      </div>
      
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        CollabDoc • Minimalist Space
      </div>
    </div>
  );
}