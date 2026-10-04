import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'STORE_OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Normal User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/dashboard" element={<UserDashboardPage />} />
          </Route>

          {/* Store Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Root Redirect & Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
