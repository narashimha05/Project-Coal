import React from 'react'
import AdminPage from './AdminPage'
import Leaderboard from '../components/Leaderboard'
import Navbar from '../components/Navbar'
const Mainpage = () => {
  return (
    <div>
      {/* <AdminPage /> */}
      <Navbar />
      <Leaderboard />
    </div>
  )
}

export default Mainpage