import Navbar from '@/components/Navbar'
import { Footer } from '@/components/ui/Footer'
import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLyout = () => {
  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar/>
      <div>
        <Outlet/>
      </div>
      <div>
        <Footer/>
      </div>
    </div>
  )
}

export default MainLyout
