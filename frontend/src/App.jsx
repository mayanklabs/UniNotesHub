// src/App.jsx
import './App.css';
import MainLyout from './layout/MainLyout';
import { RouterProvider, Navigate } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
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
import React, { useEffect } from 'react';
import PYQForm from './pages/user/PYQForm';
import { Toaster } from "sonner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLyout />,
    children: [
      {
        path: "/",
        element: <Hero />,
      },
      {
        path: "/universities",
        element: <UniversityTable />,
      },
      {
        path: "/program",
        element: <ProgramName />,
      },
      {
        path: "/branch",
        element: <BranchName />,
      },
      {
        path: "/course",
        element: <CourseName />,
      },
      {
        path: "/questions",
        element: <QuestionsList />,
      },
      {
        path: "/editProfile",
        element: <ProtectedRoute><EditProfile /></ProtectedRoute>,
      },
      {
        path: "/uploadpyq",
        element: <ProtectedRoute><PYQForm /></ProtectedRoute>,
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/password/reset/confirm/:uidb64/:token",
    element: <PasswordResetConfirm />,
  },
]);

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
      <RouterProvider router={appRouter} />
      <Toaster richColors />
    </main>
  );
}

export default App;