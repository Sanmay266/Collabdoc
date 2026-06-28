import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, createDocument, deleteDocument } from "../services/documentService";
import { removeToken } from "../utils/token";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "Jane Doe" });

  const navigate = useNavigate();

  useEffect(() => {
    // Load user profile
    const profile = localStorage.getItem("collabdoc_user_profile");
    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }
    
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    setIsCreating(true);
    try {
      const newDoc = await createDocument("Untitled Document", "");
      navigate(`/document/${newDoc.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create document");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation(); // Prevent row click navigation
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter((doc) => doc.id !== id));
      } catch (error) {
        console.error(error);
        alert("Failed to delete document");
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("collabdoc_user_profile");
    navigate("/login");
  };

  // Filter documents by title or content
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="app-container scrollable-y fade-in" style={{ paddingBottom: "60px" }}>
      {/* Header bar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 0",
        borderBottom: "var(--border-thin)",
        marginBottom: "48px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "2rem",
            fontWeight: "400",
            letterSpacing: "-0.01em"
          }}>CollabDoc</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Hello, <strong style={{ color: "var(--text-primary)" }}>{userProfile.name}</strong>
          </span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace Actions */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "32px"
      }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", margin: 0 }}>Workspace</h2>
          <p style={{ fontSize: "0.95rem" }}>Draft, format, and organize your ideas quietly.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search..."
            className="form-input"
            style={{ width: "240px", padding: "10px 14px", fontSize: "0.9rem" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={handleCreateDocument} 
            disabled={isCreating} 
            className="btn btn-primary"
            style={{ height: "fit-content", whiteSpace: "nowrap" }}
          >
            {isCreating ? "Creating..." : "New Document"}
          </button>
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Gathering your writing space...
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "var(--bg-secondary)" }}>
          <h3 style={{ marginBottom: "12px", fontFamily: "var(--font-serif)" }}>
            {searchQuery ? "No matching documents" : "No documents found"}
          </h3>
          <p style={{ marginBottom: "24px" }}>
            {searchQuery 
              ? "Try adjusting your search terms to find what you need." 
              : "Every great idea starts with a clean slate. Create your first document now."}
          </p>
          {!searchQuery && (
            <button onClick={handleCreateDocument} className="btn btn-primary">
              Create Document
            </button>
          )}
        </div>
      ) : (
        <div style={{
          border: "var(--border-thin)",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#ffffff"
        }}>
          {filteredDocuments.map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/document/${doc.id}`)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: idx === filteredDocuments.length - 1 ? "none" : "var(--border-thin)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
              }}
              className="doc-list-row"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <h4 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  margin: "0 0 4px 0",
                  color: "var(--text-primary)"
                }}>
                  {doc.title || "Untitled Document"}
                </h4>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "500px"
                }}>
                  {doc.content ? doc.content.substring(0, 120) : "No content yet"}
                </p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "24px"
              }}>
                <span style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap"
                }}>
                  Updated {formatDate(doc.updatedAt)}
                </span>
                
                <button
                  onClick={(e) => handleDeleteDocument(doc.id, e)}
                  className="btn-text"
                  style={{
                    color: "#a04040",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Delete Document"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}