import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import CyberLayout from "./components/CyberLayout";
import DashboardView from "./pages/DashboardView";
import ChatbotView from "./pages/ChatbotView";
import ReportAnalyzerView from "./pages/ReportAnalyzerView";
import SymptomGuidanceView from "./pages/SymptomGuidanceView";
import BookDoctorView from "./pages/BookDoctorView";
import HistoryView from "./pages/HistoryView";
import AdminDoctorVerificationView from "./pages/AdminDoctorVerificationView";
import AdminActivityAuditView from "./pages/AdminActivityAuditView";
import AdminBookingsView from "./pages/AdminBookingsView";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <CyberLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/chat" element={<ChatbotView />} />
              <Route path="/report-analyzer" element={<ReportAnalyzerView />} />
              <Route path="/reports" element={<Navigate to="/report-analyzer" replace />} />
              <Route path="/symptom-guidance" element={<SymptomGuidanceView />} />
              <Route path="/book-doctor" element={<BookDoctorView />} />
              <Route path="/doctors" element={<Navigate to="/book-doctor" replace />} />
              <Route path="/history" element={<HistoryView />} />

              {/* Administrator Dedicated Routes */}
              <Route path="/admin/doctor-verification" element={<AdminDoctorVerificationView />} />
              <Route path="/admin/activities" element={<AdminActivityAuditView />} />
              <Route path="/admin/bookings" element={<AdminBookingsView />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </CyberLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;