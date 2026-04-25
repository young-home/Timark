import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import App from './App'
import './index.css'

// 包装 AuthProvider 以使用 useNavigate
function AuthProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/login');
  };
  return <AuthProvider onLogoutCallback={handleLogout}>{children}</AuthProvider>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<App />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProviderWithNavigate>
        <AppRoutes />
      </AuthProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
