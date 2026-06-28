import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, updateDocument, getDocumentHistory, restoreDocumentVersion, shareDocument } from "../services/documentService";


import {
  connectWebSocket,
  disconnectWebSocket,
  sendEditMessage
} from "../services/websocketService.js";
export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {

    connectWebSocket(
        id,
        (message) => {

          setContent(message.content);

        }
    );

    return () => {

      disconnectWebSocket();
    };

  }, []);

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved"); // "Saved", "Saving...", "Error"
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedHistoryVer, setSelectedHistoryVer] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Separate states for history lists and share settings
  const [history, setHistory] = useState([]);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("VIEWER");
  const [shareSuccess, setShareSuccess] = useState("");
  const [shareError, setShareError] = useState("");

  const autoSaveTimerRef = useRef(null);

  // Load history data separately
  const fetchHistory = async () => {
    try {
      const historyData = await getDocumentHistory(id);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to load history list:", err);
    }
  };

  // Load document on mount or ID change
  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true);
      try {
        const doc = await getDocumentById(id);
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setSelectedHistoryVer(null);
        await fetchHistory();
      } catch (err) {
        console.error(err);
        alert("Could not load document.");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  // Handle saving logic
  const saveDocData = async (updatedTitle, updatedContent) => {
    setSaveStatus("Saving...");
    try {
      const updated = await updateDocument(id, updatedTitle, updatedContent);
      setDocument(updated);
      setSaveStatus("Saved");
      await fetchHistory(); // Refresh history panel
    } catch (err) {
      console.error(err);
      setSaveStatus("Error");
    }
  };

  // Debounced auto-save triggers whenever title or content changes
  const handleTextChange = (newTitle, newContent) => {

    setTitle(newTitle);
    setContent(newContent);

    sendEditMessage({
      documentId: id,
      content: newContent,
      username: "sanmay"
    });

    setSaveStatus("Saving...");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDocData(newTitle, newContent);
    }, 1200);
  };

  // Immediate save on button click/blur
  const handleImmediateSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    saveDocData(title, content);
  };

  const handleCopyShareLink = () => {
    const mockLink = `${window.location.origin}/shared/doc-${id}`;
    navigator.clipboard.writeText(mockLink).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const loadHistoryVersion = (historyItem) => {
    setSelectedHistoryVer(historyItem);
    // Temporarily view historical contents
    setTitle(historyItem.title);
    setContent(historyItem.content);
  };

  const restoreCurrentVersion = () => {
    setSelectedHistoryVer(null);
    setTitle(document.title);
    setContent(document.content);
  };

  const commitVersionRestoration = async () => {
    if (selectedHistoryVer) {
      setSelectedHistoryVer(null);
      setSaveStatus("Saving...");
      try {
        const restored = await restoreDocumentVersion(id, selectedHistoryVer.id);
        setDocument(restored);
        setTitle(restored.title);
        setContent(restored.content);
        setSaveStatus("Saved");
        await fetchHistory(); // Refresh history panel
      } catch (err) {
        console.error(err);
        setSaveStatus("Error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="app-container flex-col align-center justify-between" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>Opening Document</h2>
          <p>Loading editor environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container fade-in" style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 0 }}>
      {/* Editor Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "var(--border-thin)",
        backgroundColor: "var(--bg-primary)",
        zIndex: 10
      }}>
        {/* Left header: Back and status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Dashboard
          </button>
          
          <span style={{
            fontSize: "0.85rem",
            color: saveStatus === "Error" ? "#a04040" : "var(--text-secondary)",
            padding: "4px 8px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "4px",
            border: "var(--border-thin)",
            fontFamily: "var(--font-sans)"
          }}>
            {selectedHistoryVer ? "Viewing History Version" : saveStatus}
          </span>
        </div>

        {/* Right header: Editor controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {selectedHistoryVer ? (
            <>
              <button 
                onClick={commitVersionRestoration} 
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Restore Selected Version
              </button>
              <button 
                onClick={restoreCurrentVersion} 
                className="btn btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleImmediateSave} 
                className="btn btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Save Now
              </button>
              <button 
                onClick={() => { setShowShare(true); setShowHistory(false); setShareSuccess(""); setShareError(""); }} 
                className="btn btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Share
              </button>
              <button 
                onClick={() => { setShowHistory(!showHistory); setShowShare(false); }} 
                className={`btn ${showHistory ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                {showHistory ? "Hide History" : "Version History"}
              </button>


            </>
          )}
        </div>
      </header>

      {/* Editor Body Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* Core Writing Space */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "60px 40px",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#faf9f6"
        }}>
          <div style={{ width: "100%", maxWidth: "720px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Title Input */}
            <input
              type="text"
              placeholder="Untitled Document"
              value={title}
              onChange={(e) => handleTextChange(e.target.value, content)}
              disabled={!!selectedHistoryVer}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "3.2rem",
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                outline: "none",
                width: "100%",
                paddingBottom: "8px",
                borderBottom: "1px solid transparent",
                transition: "var(--transition-smooth)"
              }}
              onFocus={(e) => {
                if (!selectedHistoryVer) e.target.style.borderBottomColor = "var(--border-medium)";
              }}
              onBlur={(e) => {
                e.target.style.borderBottomColor = "transparent";
                if (!selectedHistoryVer) handleImmediateSave();
              }}
            />

            {/* Content Writing Area */}
            <textarea
              placeholder="Start drafting your document here..."
              value={content}
              onChange={(e) => handleTextChange(title, e.target.value)}
              disabled={!!selectedHistoryVer}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.1rem",
                lineHeight: "1.7",
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                outline: "none",
                width: "100%",
                flexGrow: 1,
                resize: "none",
                minHeight: "450px"
              }}
              onBlur={() => {
                if (!selectedHistoryVer) handleImmediateSave();
              }}
            />

          </div>
        </main>

        {/* Sidebar: Version History Panel */}
        {showHistory && (
          <aside style={{
            width: "320px",
            borderLeft: "var(--border-thin)",
            backgroundColor: "var(--bg-secondary)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: 5
          }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", margin: 0 }}>Version History</h3>
              <button 
                onClick={() => setShowHistory(false)} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Click any previous version below to inspect or restore historical edits.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history && history.slice().reverse().map((item, idx) => {
                const isSelected = selectedHistoryVer && selectedHistoryVer.id === item.id;
                const isCurrent = !selectedHistoryVer && idx === 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryVersion(item)}
                    style={{
                      padding: "12px 16px",
                      border: "var(--border-thin)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#ffffff" : isCurrent ? "rgba(28,26,23,0.04)" : "var(--bg-primary)",
                      transition: "var(--transition-smooth)",
                      boxShadow: isSelected ? "var(--shadow-subtle)" : "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "var(--border-medium)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "var(--border-thin)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Version {history.length - idx}</span>
                      {isCurrent && <span style={{ fontSize: "0.75rem", backgroundColor: "var(--text-primary)", color: "var(--bg-primary)", padding: "2px 6px", borderRadius: "2px" }}>Current</span>}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Modal: Share Settings (Overlay) */}
        {showShare && (
          <div style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0, left: 0,
            backgroundColor: "rgba(28, 26, 23, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20
          }} onClick={() => setShowShare(false)}>
            
            <div 
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "var(--border-thin)",
                borderRadius: "4px",
                width: "100%",
                maxWidth: "480px",
                padding: "32px",
                boxShadow: "var(--shadow-hover)"
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", margin: 0 }}>Share Settings</h3>
                <button 
                  onClick={() => setShowShare(false)} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Generate a read-only link to share this document. Anyone with the link can view your drafts.
              </p>

              <div className="form-group">
                <label className="form-label">Private Document Link</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/shared/doc-${id}`}
                    className="form-input"
                    style={{ flex: 1, fontSize: "0.85rem", backgroundColor: "var(--bg-secondary)" }}
                  />
                  <button 
                    onClick={handleCopyShareLink}
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", padding: "10px 16px" }}
                  >
                    {copyFeedback ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {shareSuccess && (
                <div style={{ padding: "8px 12px", border: "1px solid #cce8cf", backgroundColor: "#f2faf3", color: "#276a30", fontSize: "0.85rem", borderRadius: "4px", marginBottom: "16px" }}>
                  {shareSuccess}
                </div>
              )}

              {shareError && (
                <div style={{ padding: "8px 12px", border: "1px solid #e5c0b0", backgroundColor: "#faf2ee", color: "#b04020", fontSize: "0.85rem", borderRadius: "4px", marginBottom: "16px" }}>
                  {shareError}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setShareSuccess("");
                setShareError("");
                try {
                  const msg = await shareDocument(id, shareEmail, sharePermission);
                  setShareSuccess(msg);
                  setShareEmail("");
                } catch (err) {
                  setShareError(err.message || "Failed to share document.");
                }
              }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="share-email-input">Share with User (Email)</label>
                  <input
                    id="share-email-input"
                    type="email"
                    required
                    placeholder="user@example.com"
                    className="form-input"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="share-permission-select">Permission Role</label>
                  <select
                    id="share-permission-select"
                    className="form-input"
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    style={{ appearance: "auto" }}
                  >
                    <option value="VIEWER">Viewer (Read Only)</option>
                    <option value="EDITOR">Editor (Read/Write)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                  Grant Access
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button onClick={() => setShowShare(false)} className="btn btn-secondary">
                  Close Settings
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}