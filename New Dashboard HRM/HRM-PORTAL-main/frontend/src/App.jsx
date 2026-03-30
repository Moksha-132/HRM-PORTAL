import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './index.css';

import ChatbotApp from './components/chatbot/ChatbotApp.jsx';
import GlobalNotificationListener from './components/common/GlobalNotificationListener.jsx';

function App() {
  return (
    <BrowserRouter>
      <GlobalNotificationListener />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotApp />
    </BrowserRouter>
  );
}

export default App;
