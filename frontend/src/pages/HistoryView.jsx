import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function HistoryView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState(isAdmin ? "accountant" : "chats");
  const [chats, setChats] = useState([]);
  const [reports, setReports] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txStats, setTxStats] = useState({ totalGross: 0, totalPlatformFee: 0, totalDoctorPayout: 0, settledCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      setActiveTab("accountant");
    } else {
      setActiveTab("chats");
    }
    fetchHistory();
  }, [isAdmin]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [histRes, txRes] = await Promise.all([
        API.get("/api/history").catch(() => ({ data: {} })),
        isAdmin ? API.get("/api/admin/accountant/transactions").catch(() => ({ data: {} })) : Promise.resolve({ data: {} })
      ]);

      setChats(histRes.data?.chats || []);
      setReports(histRes.data?.reports || []);

      if (txRes.data?.success) {
        setTransactions(txRes.data.transactions || []);
        if (txRes.data.stats) {
          setTxStats(txRes.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportAccountantCSV = () => {
    if (!transactions.length) return;
    const headers = "Invoice Number,Patient Name,Patient Email,Doctor Name,Doctor Email,Service Type,Total Amount ($),Platform Fee ($),Doctor Payout ($),Payment Method,Payment Status,Transaction Date\n";
    const rows = transactions.map(t =>
      `"${t.invoice_no}","${t.patient_name}","${t.patient_email || ''}","${t.doctor_name}","${t.doctor_email || ''}","${t.service_type}",${t.amount},${t.platform_fee},${t.doctor_payout},"${t.payment_method}","${t.payment_status}","${t.transaction_date}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SUSHRUTA_ACCOUNTANT_FINANCIAL_LEDGER_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fade-in 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: 22 }}>
            📁 {isAdmin ? "SYSTEM HISTORY & ACCOUNTANT FINANCIAL LEDGER" : "SESSION HISTORY"}
          </h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {isAdmin
              ? "Comprehensive audit of medical sessions, consultation billings, doctor revenue payouts, and financial transactions."
              : "Browse past AI consultations and report analyses stored locally in your SQLite database."}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn-cyber"
            onClick={exportAccountantCSV}
            style={{
              fontSize: 11,
              padding: "10px 18px",
              background: "linear-gradient(135deg, rgba(0, 255, 135, 0.15), rgba(102, 252, 241, 0.2))",
              border: "1px solid var(--neon-green)",
              color: "var(--neon-green)",
            }}
          >
            <span>📥 EXPORT ACCOUNTANT CSV</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ margin: 0 }}>
        {isAdmin && (
          <button
            className={`tab-btn ${activeTab === "accountant" ? "active" : ""}`}
            onClick={() => setActiveTab("accountant")}
            style={{ color: activeTab === "accountant" ? "var(--neon-green)" : undefined }}
          >
            💰 Accountant Ledger ({transactions.length})
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          💬 Chat History ({chats.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📊 Report History ({reports.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="cyber-spinner" style={{ margin: "0 auto 16px" }}></div>
          <div style={{ color: "var(--neon-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Loading history & financial records...
          </div>
        </div>
      )}

      {/* Accountant & Financial Ledger (Admin Only) */}
      {!loading && activeTab === "accountant" && isAdmin && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Revenue KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div className="cyber-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                💵 GROSS CONSULT REVENUE
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--neon-cyan)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
                ${txStats.totalGross?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                Across {transactions.length} billed clinical sessions
              </div>
            </div>

            <div className="cyber-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: "var(--neon-green)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                🏛️ PLATFORM FACILITY FEE (15%)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--neon-green)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
                ${txStats.totalPlatformFee?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                Retained AI infrastructure commission
              </div>
            </div>

            <div className="cyber-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: "var(--neon-purple)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                👩‍⚕️ DOCTOR PAYOUT DISBURSEMENTS
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--neon-purple)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
                ${txStats.totalDoctorPayout?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                Net physician payouts (85%)
              </div>
            </div>

            <div className="cyber-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: "var(--text-primary)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                💳 SETTLED TRANSACTIONS
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)", marginTop: 4 }}>
                {txStats.settledCount || 0} / {transactions.length}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                Fully reconciled payment receipts
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: 1, color: "var(--text-primary)" }}>
                ACCOUNTANT GENERAL FINANCIAL LEDGER
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--neon-green)" }}>
                ● AUDIT COMPLIANT
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-default)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                    <th style={{ padding: "10px 14px" }}>INVOICE REF</th>
                    <th style={{ padding: "10px 14px" }}>DATE</th>
                    <th style={{ padding: "10px 14px" }}>PATIENT</th>
                    <th style={{ padding: "10px 14px" }}>ATTENDING DOCTOR</th>
                    <th style={{ padding: "10px 14px" }}>SERVICE TYPE</th>
                    <th style={{ padding: "10px 14px" }}>GROSS</th>
                    <th style={{ padding: "10px 14px" }}>PLATFORM (15%)</th>
                    <th style={{ padding: "10px 14px" }}>DOCTOR PAYOUT</th>
                    <th style={{ padding: "10px 14px" }}>PAYMENT METHOD</th>
                    <th style={{ padding: "10px 14px" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: "1px solid var(--border-default)", transition: "background 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-input)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", fontWeight: 700 }}>
                        {tx.invoice_no}
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: 11 }}>
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {tx.patient_name}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--neon-purple)" }}>
                        {tx.doctor_name}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                        {tx.service_type}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--neon-green)", fontFamily: "var(--font-mono)" }}>
                        ${tx.platform_fee.toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--neon-purple)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        ${tx.doctor_payout.toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: 11 }}>
                        {tx.payment_method}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          className={`status-badge ${
                            tx.payment_status === "Settled" || tx.payment_status === "Completed"
                              ? "optimal"
                              : "attention"
                          }`}
                          style={{ fontSize: 9 }}
                        >
                          {tx.payment_status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      {!loading && activeTab === "chats" && (
        <div className="history-list">
          {chats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-text">No chat history yet</div>
              <div className="empty-hint">Start a conversation with the AI chatbot</div>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="history-item"
                onClick={() => setExpandedId(expandedId === chat.id ? null : chat.id)}
              >
                <div className="history-query">
                  {chat.sender === "User" ? "🧑 " : "⚕ "}
                  {chat.message}
                </div>
                <div className="history-meta">
                  {formatDate(chat.created_at)}
                  {chat.keywords && ` • Keywords: ${chat.keywords}`}
                </div>
                {expandedId === chat.id && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-default)",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {chat.response}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Report History */}
      {!loading && activeTab === "reports" && (
        <div className="history-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">No reports analyzed yet</div>
              <div className="empty-hint">Upload a report to see analysis history</div>
            </div>
          ) : (
            reports.map((report) => {
              let biomarkers = [];
              try {
                biomarkers = typeof report.biomarkers === "string"
                  ? JSON.parse(report.biomarkers)
                  : report.biomarkers || [];
              } catch { biomarkers = []; }

              return (
                <div
                  key={report.id}
                  className="history-item"
                  onClick={() => setExpandedId(expandedId === `r-${report.id}` ? null : `r-${report.id}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="history-query">📄 {report.title}</div>
                    <span className={`status-badge ${report.status || "optimal"}`}>
                      {report.status === "attention" ? "⚠ ATTENTION" : "✓ OPTIMAL"}
                    </span>
                  </div>
                  <div className="history-meta">
                    {report.filename} • {formatDate(report.created_at)}
                  </div>
                  {expandedId === `r-${report.id}` && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                        {report.summary}
                      </div>
                      {biomarkers.length > 0 && (
                        <div className="biomarker-grid">
                          {biomarkers.map((bio, i) => (
                            <div key={i} className="biomarker-item">
                              <div>
                                <div className="bio-name">{bio.name}</div>
                                <div className="bio-ref">Ref: {bio.ref}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div className="bio-value" style={{ color: bio.status === "Optimal" ? "var(--neon-green)" : "var(--neon-amber)" }}>
                                  {bio.value}
                                </div>
                                <div className="bio-ref">{bio.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Refresh */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button className="btn-cyber" onClick={fetchHistory} disabled={loading}>
          <span>🔄 REFRESH HISTORY</span>
        </button>
      </div>
    </div>
  );
}
