import './App.css'
import MainLyout from './layout/MainLyout'
import { RouterProvider } from 'react-router'
import EditProfile from './pages/user/Profile'
import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import Hero from './pages/Hero'
import UniversitiyTable from './pages/university/UniversitiyTable'
import Branch from './pages/university/Branch'
import CourseName from './pages/university/CourseName'
import ProgramName from './pages/university/ProgramName'
import QuestionsList from './pages/university/QuestionsList'




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
        path: "login/EditProfile",
        element: <EditProfile />
      },
      {
        path: "course",
        element: <CourseName/>
      },
      {
        path: "branch",
        element: <Branch />
      },
      {
        path: "program",
        element: <ProgramName />
      },
      {
        path: "questions",
        element: <QuestionsList />
      },
      
    ],
  },
  {
      path: "login",
      element: <Login />
  }
])

function App() {
  return (
    <>
      <main>
        <RouterProvider router={appRouter} />
      </main>
    </>
  )
}

export default App
