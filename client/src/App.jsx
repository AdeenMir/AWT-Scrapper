import { Routes, Route, Navigate } from "react-router-dom";
import { DarkModeProvider } from "./context/DarkModeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import ReportView from "./pages/ReportView";
import Schedules from "./pages/Schedules";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth>
            <Reports />
          </RequireAuth>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <RequireAuth>
            <ReportView />
          </RequireAuth>
        }
      />
      <Route
        path="/schedules"
        element={
          <RequireAuth>
            <Schedules />
          </RequireAuth>
        }
      />
      <Route
        path="/faq"
        element={
          <RequireAuth>
            <FAQ />
          </RequireAuth>
        }
      />
      <Route
        path="/contact"
        element={
          <RequireAuth>
            <Contact />
          </RequireAuth>
        }
      />
      <Route
        path="/account"
        element={
          <RequireAuth>
            <Account />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </DarkModeProvider>
  );
}
