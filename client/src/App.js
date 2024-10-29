import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Mainpage from './pages/Mainpage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/user/signin" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Mainpage />} />

          <Route path="/user/signin" element={<Signin />} />
          <Route path="/user/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              
                <AdminPage />
            
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
