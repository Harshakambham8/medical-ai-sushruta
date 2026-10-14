import React, { useState, useEffect } from "react";
import API, { API_BASE_URL } from "../services/api";

export default function AdminDoctorVerificationView() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'approved'
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });
  const [selectedCertDoctor, setSelectedCertDoctor] = useState(null);

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
        if (selectedCertDoctor && selectedCertDoctor.id === doc.id) {
          setSelectedCertDoctor((prev) => (prev ? { ...prev, is_approved: 1 } : null));
        }
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
        if (selectedCertDoctor && selectedCertDoctor.id === doc.id) {
          setSelectedCertDoctor((prev) => (prev ? { ...prev, is_approved: 0 } : null));
        }
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

                {/* Doctor Certification Document & License */}
                <div
                  style={{
                    background: doc.certificate_url ? "rgba(102, 252, 241, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: doc.certificate_url ? "1px solid rgba(102, 252, 241, 0.3)" : "1px dashed var(--border-default)",
                    borderRadius: "var(--radius)",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      ORIGINAL MEDICAL CERTIFICATION
                    </span>
                    {doc.license_number && (
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--neon-purple)", fontWeight: 700 }}>
                        LIC: {doc.license_number}
                      </span>
                    )}
                  </div>

                  {doc.certificate_url ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 16 }}>📜</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-primary)",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 180,
                          }}
                        >
                          {doc.certificate_filename || "Original_Certification.pdf"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCertDoctor(doc)}
                        className="btn-cyber"
                        style={{
                          fontSize: 10,
                          padding: "5px 12px",
                          background: "rgba(102, 252, 241, 0.15)",
                          border: "1px solid var(--neon-cyan)",
                          color: "var(--neon-cyan)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span>👁️ INSPECT</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>⚠️</span>
                      <span>No document uploaded (Legacy Demo)</span>
                    </div>
                  )}
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

      {/* CERTIFICATION INSPECTION MODAL */}
      {selectedCertDoctor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(12px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fade-in 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCertDoctor(null);
          }}
        >
          <div
            className="cyber-card"
            style={{
              width: "100%",
              maxWidth: 900,
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              padding: 24,
              boxShadow: "var(--glow-cyan)",
              border: "1px solid var(--neon-cyan)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid var(--border-default)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>📜</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 17, color: "var(--text-primary)" }}>
                      Original Medical Certification — {selectedCertDoctor.name}
                    </h3>
                    <span className={`status-badge ${selectedCertDoctor.is_approved ? "optimal" : "attention"}`}>
                      {selectedCertDoctor.is_approved ? "✓ APPROVED" : "⏳ PENDING REVIEW"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                    Specialty: {selectedCertDoctor.specialization} • License No: {selectedCertDoctor.license_number || "Not specified"} • ID: #DOC-{String(selectedCertDoctor.id).padStart(4, "0")}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCertDoctor(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Document Viewer Body */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 460, display: "flex", flexDirection: "column" }}>
              {selectedCertDoctor.certificate_url ? (
                (() => {
                  const certUrl = selectedCertDoctor.certificate_url.startsWith("http")
                    ? selectedCertDoctor.certificate_url
                    : `${API_BASE_URL}${selectedCertDoctor.certificate_url}`;
                  const isPdf = selectedCertDoctor.certificate_url.toLowerCase().endsWith(".pdf") ||
                    (selectedCertDoctor.certificate_filename && selectedCertDoctor.certificate_filename.toLowerCase().endsWith(".pdf"));

                  return (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--bg-input)",
                          padding: "8px 12px",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span>📄</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {selectedCertDoctor.certificate_filename || "Doctor_Certification.pdf"}
                          </span>
                        </div>

                        <a
                          href={certUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          style={{
                            fontSize: 11,
                            color: "var(--neon-cyan)",
                            textDecoration: "none",
                            fontFamily: "var(--font-mono)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>🔗 Open in Full Window / Download</span>
                        </a>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minHeight: 480,
                          background: "#111",
                          borderRadius: "var(--radius)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid var(--border-default)",
                        }}
                      >
                        {isPdf ? (
                          <iframe
                            src={certUrl}
                            title="Original Medical Certification"
                            style={{ width: "100%", height: 500, border: "none", background: "#fff" }}
                          />
                        ) : (
                          <img
                            src={certUrl}
                            alt="Doctor Certification"
                            style={{
                              maxWidth: "100%",
                              maxHeight: 500,
                              objectFit: "contain",
                              borderRadius: 4,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    No Certificate Document Attached
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    This physician profile was created prior to certificate upload enforcement or is a seeded demo profile.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 16,
                borderTop: "1px solid var(--border-default)",
                marginTop: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                ADMINISTRATIVE VERIFICATION DECISION:
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {!selectedCertDoctor.is_approved ? (
                  <button
                    onClick={() => handleApprove(selectedCertDoctor)}
                    disabled={actionLoading === selectedCertDoctor.id}
                    className="btn-cyber"
                    style={{
                      fontSize: 11,
                      padding: "9px 18px",
                      background: "rgba(0, 255, 135, 0.2)",
                      border: "1px solid var(--neon-green)",
                      color: "var(--neon-green)",
                    }}
                  >
                    <span>{actionLoading === selectedCertDoctor.id ? "Approving..." : "✓ VERIFY CREDENTIALS & APPROVE DOCTOR"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReject(selectedCertDoctor)}
                    disabled={actionLoading === selectedCertDoctor.id}
                    className="btn-cyber"
                    style={{
                      fontSize: 11,
                      padding: "9px 18px",
                      background: "rgba(255, 0, 64, 0.15)",
                      border: "1px solid var(--neon-red)",
                      color: "var(--neon-red)",
                    }}
                  >
                    <span>{actionLoading === selectedCertDoctor.id ? "Suspending..." : "✕ SUSPEND / REJECT PRIVILEGES"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCertDoctor(null)}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                    padding: "9px 16px",
                    borderRadius: "var(--radius)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
