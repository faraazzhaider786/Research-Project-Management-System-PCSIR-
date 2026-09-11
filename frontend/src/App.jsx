import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ReferencePage from "./pages/ReferencePage";
import RndProgramsPage from "./pages/RndProgramsPage";
import UserAccountsPage from "./pages/UserAccountsPage";
import ProgressReportsPage from "./pages/ProgressReportsPage";
import ExtensionRequestsPage from "./pages/ExtensionRequestsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rnd-programs" element={<RndProgramsPage />} />
              <Route path="/progress-reports" element={<ProgressReportsPage />} />
              <Route path="/extension-requests" element={<ExtensionRequestsPage />} />
              <Route path="/employees" element={<ReferencePage resource="employees" />} />
              <Route path="/complexes" element={<ReferencePage resource="complexes" />} />
              <Route path="/labs" element={<ReferencePage resource="labs" />} />
              <Route path="/centers" element={<ReferencePage resource="centers" />} />
              <Route path="/fields-of-study" element={<ReferencePage resource="fields" />} />
              <Route path="/funding-agencies" element={<ReferencePage resource="agencies" />} />
              <Route path="/psdp-projects" element={<ReferencePage resource="psdp" />} />
              <Route path="/user-accounts" element={<UserAccountsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
