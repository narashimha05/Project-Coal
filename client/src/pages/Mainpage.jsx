import React from 'react'
import AdminPage from './AdminPage'
import Leaderboard from '../components/Leaderboard'
import Navbar from '../components/Navbar'
const Mainpage = ({API}) => {
  return (
    <div>
      {/* <AdminPage /> */}
      <Navbar />
      <Leaderboard API={API} />
    </div>
  )
}

export default Mainpage