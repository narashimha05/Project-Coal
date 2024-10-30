import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Mainpage from "./pages/Mainpage";
import AdminPage from "./pages/AdminPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/user/signin" />;
};

function App() {
  const API = process.env.REACT_APP_API_URL;

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Mainpage API={API} />} />
          <Route path="/user/signin" element={<Signin API={API} />} />
          <Route path="/user/signup" element={<Signup API={API} />} />
          <Route path="/admin" element={<AdminPage API={API} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
