import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Header from "./components/Header";
import UpdateProfile from "./components/UpdateProfile";
import ChangePassword from "./components/ChangePassword";

function App() {
  return (
    <AuthProvider>
      {/* Wrapping the entire application in AuthProvider to provide auth context */}
      <Router>
        <Header />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
