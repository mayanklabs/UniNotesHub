// src/App.jsx
import './App.css';
import MainLyout from './layout/MainLyout';
import Login from './pages/Login';
import Hero from './pages/Hero';
import UniversityTable from './pages/university/UniversitiyTable'; // Typo fixed in import
import BranchName from './pages/university/Branch';
import CourseName from './pages/university/CourseName';
import ProgramName from './pages/university/ProgramName';
import QuestionsList from './pages/university/QuestionsList';
import { useAuthStore } from './store/authStore';
import Dashboard from './pages/user/Dashboard';
import EditProfile from './pages/user/EditProfile';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import ForgotPassword from './pages/ForgotPassword';
import { useEffect } from 'react';
import PYQForm from './pages/user/PYQForm';
import { Toaster } from "sonner";
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (storedUser && token && refreshToken) {
      setAuth(storedUser, token, refreshToken);
    }
  }, [setAuth]);

  return (
    <main>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLyout />}>
            <Route index element={<Hero />} />
            <Route path="universities" element={<UniversityTable />} />
            <Route path="program" element={<ProgramName />} />
            <Route path="branch" element={<BranchName />} />
            <Route path="course" element={<CourseName />} />
            <Route path="questions" element={<QuestionsList />} />
            <Route path="editProfile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="uploadpyq" element={<ProtectedRoute><PYQForm /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password/reset/confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
        </Routes>
      </HashRouter>
      <Toaster richColors />
    </main>
  );
}

export default App;
