import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import UpdateProfile from "./components/UpdateProfile";
import ChangePassword from "./components/ChangePassword";
import AddSkill from "./components/AddSkill";
import Header from "./components/Header";
import MentorProfile from "./components/MentorProfile";
import ScheduleSessionPage from "./components/ScheduleSessionPage";
import UpcomingSessionsPage from "./components/UpcomingSessionsPage";
import SessionHistoryPage from "./components/SessionHistoryPage";
import MyConnectionsPage from "./components/MyConnectionsPage";

function App() {
  return (
    <AuthProvider>
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
            <Route path="/add-skill" element={<AddSkill />} />
            <Route path="/mentors/:mentorId" element={<MentorProfile />} />
            <Route path="/dashboard" element={<MyConnectionsPage />} />
            <Route path="/schedule-session" element={<ScheduleSessionPage />} />
            <Route path="/upcoming-sessions" element={<UpcomingSessionsPage />} />
            <Route path="/session-history" element={<SessionHistoryPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
