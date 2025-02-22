import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import MainLyout from './layout/MainLyout'
import { RouterProvider } from 'react-router'
import Navbar from './components/Navbar'
import EditProfile from './pages/Profile'
import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import Hero from './pages/Hero'



const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLyout />,
    children: [
      {
        path: "/",
        element: (
          <>
          <Hero/>
          </>
        ),
      },
      {
        path:"login",
        element:<Login/>
      },
      {
        path:"EditProfile",
        element:<EditProfile/>
      }
    ],
  },
])

function App() {
  return (
    <>
      <main>
        <RouterProvider router={appRouter}/>
      </main>
    </>
  )
}

export default App
