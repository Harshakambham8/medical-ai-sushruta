import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminDoctorVerificationView() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'approved'
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/admin/doctors");
      if (res.data.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      showToast("error", "Failed to load doctor directory from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: "", text: "" });
    }, 4500);
  };

  const handleApprove = async (doc) => {
    setActionLoading(doc.id);
    try {
      const res = await API.put(`/api/admin/doctors/${doc.id}/approve`);
      if (res.data.success) {
        showToast("success", `✓ Doctor credentials verified! ${doc.name} is now approved to practice.`);
        fetchDoctors();
      }
    } catch (err) {
      showToast("error", `Failed to approve doctor: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doc) => {
    if (!window.confirm(`Are you sure you want to suspend or reject verification for ${doc.name}?`)) {
      return;
    }
    setActionLoading(doc.id);
    try {
      const res = await API.put(`/api/admin/doctors/${doc.id}/reject`);
      if (res.data.success) {
        showToast("warning", `⚠ ${doc.name} license verification suspended.`);
        fetchDoctors();
      }
    } catch (err) {
      showToast("error", `Failed to reject doctor: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingDoctors = doctors.filter((d) => !d.is_approved);
  const approvedDoctors = doctors.filter((d) => d.is_approved);

  const filteredDoctors = doctors.filter((d) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
        ? !d.is_approved
        : Boolean(d.is_approved);

    const matchesSearch =
      search.trim() === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (d.email && d.email.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fade-in 0.3s ease-out" }}>
      {/* Toast Alert */}
      {toastMessage.text && (
        <div
          style={{
            padding: "12px 20px",
            background:
              toastMessage.type === "success"
                ? "rgba(0, 255, 135, 0.15)"
                : toastMessage.type === "warning"
                ? "rgba(255, 170, 0, 0.15)"
                : "rgba(255, 0, 64, 0.15)",
            border:
              toastMessage.type === "success"
                ? "1px solid var(--neon-green)"
                : toastMessage.type === "warning"
                ? "1px solid #ffaa00"
                : "1px solid var(--neon-red)",
            borderRadius: "var(--radius)",
            color:
              toastMessage.type === "success"
                ? "var(--neon-green)"
                : toastMessage.type === "warning"
                ? "#ffaa00"
                : "var(--neon-red)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage({ type: "", text: "" })}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🩺</span>
            <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
              DOCTOR VERIFICATION & CREDENTIAL ACCEPTANCE
            </h1>
          </div>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Review medical licenses, verify physician board credentials, and authorize clinical practice privileges.
          </p>
        </div>

        <button
          className="btn-cyber purple"
          onClick={fetchDoctors}
          disabled={loading}
          style={{ fontSize: 11, padding: "10px 18px" }}
        >
          <span>🔄 REFRESH ROSTER</span>
        </button>
      </div>

      {/* Summary Stat Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="cyber-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            TOTAL REGISTERED PHYSICIANS
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {doctors.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Across all medical specialties
          </div>
        </div>

        <div
          className="cyber-card"
          style={{
            padding: "16px 20px",
            border: pendingDoctors.length > 0 ? "1px solid #ffaa00" : "1px solid var(--border-default)",
            background: pendingDoctors.length > 0 ? "rgba(255, 170, 0, 0.05)" : "var(--bg-card)",
          }}
        >
          <div style={{ fontSize: 11, color: "#ffaa00", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700 }}>
            ⏳ PENDING VERIFICATION
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#ffaa00", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {pendingDoctors.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Requires medical board approval
          </div>
        </div>

        <div className="cyber-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--neon-green)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            ✓ VERIFIED & ACTIVE DOCTORS
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--neon-green)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
            {approvedDoctors.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            Authorized for e-scheduling
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div
        className="cyber-card"
        style={{
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 260px", maxWidth: 420 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            className="cyber-input"
            placeholder="Search by physician name, specialty, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 12, padding: "8px 12px" }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="tab-bar" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
            style={{ padding: "6px 14px", fontSize: 11 }}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            className={`tab-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
            style={{ padding: "6px 14px", fontSize: 11, color: pendingDoctors.length > 0 ? "#ffaa00" : "inherit" }}
          >
            ⏳ Pending Review ({pendingDoctors.length})
          </button>
          <button
            className={`tab-btn ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
            style={{ padding: "6px 14px", fontSize: 11 }}
          >
            ✓ Verified ({approvedDoctors.length})
          </button>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Loading Medical Board Registry...
          </div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🩺</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            No physician profiles matching your filter.
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Try resetting the search query or tab selection.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {filteredDoctors.map((doc) => {
            const isApproved = Boolean(doc.is_approved);
            return (
              <div
                key={doc.id}
                className="cyber-card"
                style={{
                  border: !isApproved ? "1px solid rgba(255, 170, 0, 0.4)" : "1px solid var(--border-default)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Status Ribbon / Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={
                        doc.avatar ||
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={doc.name}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "10px",
                        objectFit: "cover",
                        border: isApproved ? "1px solid var(--neon-cyan)" : "1px solid #ffaa00",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--neon-purple)", fontWeight: 600 }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        ID: #DOC-{String(doc.id).padStart(4, "0")} • {doc.experience || 5} Yrs Exp
                      </div>
                    </div>
                  </div>

                  <span className={`status-badge ${isApproved ? "optimal" : "attention"}`}>
                    {isApproved ? "✓ APPROVED" : "⏳ PENDING"}
                  </span>
                </div>

                {/* Doctor Bio / Credentials */}
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {doc.bio || "Registered specialist with verified medical qualifications."}
                </p>

                {/* Specs Box */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                  <div style={{ background: "var(--bg-input)", padding: "6px 10px", borderRadius: "var(--radius)" }}>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: 9 }}>FEE RATE</span>
                    <strong style={{ color: "var(--neon-green)" }}>${doc.fees || 100} / Visit</strong>
                  </div>
                  <div style={{ background: "var(--bg-input)", padding: "6px 10px", borderRadius: "var(--radius)" }}>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: 9 }}>CONTACT</span>
                    <strong style={{ color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", display: "block", whiteSpace: "nowrap" }}>
                      {doc.email || "doctor@clinic.org"}
                    </strong>
                  </div>
                </div>

                {/* Working Availability */}
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                    VERIFIED CLINICAL DAYS:
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Array.isArray(doc.availability) && doc.availability.length > 0 ? (
                      doc.availability.map((av, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "rgba(102, 252, 241, 0.08)",
                            border: "1px solid rgba(102, 252, 241, 0.2)",
                            color: "var(--neon-cyan)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {av.day} ({av.slots?.length || 0} slots)
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Monday - Friday (Full Schedule)</span>
                    )}
                  </div>
                </div>

                {/* Admin Verification Action Buttons */}
                <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid var(--border-default)" }}>
                  {!isApproved ? (
                    <button
                      onClick={() => handleApprove(doc)}
                      disabled={actionLoading === doc.id}
                      className="btn-cyber"
                      style={{
                        flex: 1,
                        fontSize: 11,
                        padding: "8px 12px",
                        justifyContent: "center",
                        background: "rgba(0, 255, 135, 0.15)",
                        border: "1px solid var(--neon-green)",
                        color: "var(--neon-green)",
                      }}
                    >
                      <span>{actionLoading === doc.id ? "Verifying..." : "✓ VERIFY & APPROVE"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(doc)}
                      disabled={actionLoading === doc.id}
                      className="btn-cyber"
                      style={{
                        flex: 1,
                        fontSize: 11,
                        padding: "8px 12px",
                        justifyContent: "center",
                        background: "rgba(255, 0, 64, 0.12)",
                        border: "1px solid var(--neon-red)",
                        color: "var(--neon-red)",
                      }}
                    >
                      <span>{actionLoading === doc.id ? "Updating..." : "✕ SUSPEND PRIVILEGES"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
