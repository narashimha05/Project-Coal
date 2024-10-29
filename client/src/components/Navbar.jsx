// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar flex items-center">
      <h1>Welcome to Coal</h1>
      <div>
        <Link to="/user/signin" className="admin-login-btn">Admin Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
