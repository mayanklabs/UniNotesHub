import './App.css';
import MainLyout from './layout/MainLyout';
import { RouterProvider, Navigate } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Hero from './pages/Hero';
import UniversitiyTable from './pages/university/UniversitiyTable'; // Note: Check if this should be "UniversityTable"
import Branch from './pages/university/Branch';
import CourseName from './pages/university/CourseName';
import ProgramName from './pages/university/ProgramName';
import QuestionsList from './pages/university/QuestionsList';
import { useAuthStore } from './store/authStore';
import MyUploads from './pages/user/MyUploads';
import EditProfile from './pages/user/EditProfile';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import ForgotPassword from './pages/ForgotPassword'; // Import the new component
import React, { useEffect } from 'react';

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
        element: (
          <>
            <Hero />
            <UniversitiyTable />
          </>
        ),
      },
      {
        path: "editProfile",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "myuploads",
        element: (
          <ProtectedRoute>
            <MyUploads />
          </ProtectedRoute>
        ),
      },
      {
        path: "course",
        element: <CourseName />,
      },
      {
        path: "branch",
        element: <Branch />,
      },
      {
        path: "program",
        element: <ProgramName />,
      },
      {
        path: "questions",
        element: <QuestionsList />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot-password", 
    element: <ForgotPassword />,
  },
  {
    path: "password/reset/confirm/:uidb64/:token",
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
    </main>
  );
}

export default App;