import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Header from "./components/Header";
import UpdateProfile from "./components/UpdateProfile";
import ChangePassword from "./components/ChangePassword";
import AddSkill from "./components/AddSkill";
import MentorProfile from "./components/MentorProfile";
import Appointment from "./components/Appointment";
import StudentCard from "./components/StudentCard";
import MyCourseCard from "./components/MyCourseCard";
import AppointmentHistory from "./components/AppointmentHistory";
import SessionSchedule from "./components/SessionSchedule";
import MyActiveSessionsPage from "./components/MyActiveSession";
import UserActiveSessionsPage from "./components/UserActiveSession";
import SessionManagementPage from "./components/SessionManagement";
import UpcomingSessionsPage from "./components/UpcomingSession";

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
            <Route path="/mentors/:mentorId" element={<MentorProfile />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/add-skill" element={<AddSkill />} />
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/my-courses" element={<MyCourseCard />} />
            <Route path="/my-students" element={<StudentCard />} />
            <Route path="/history" element={<AppointmentHistory />} />
            <Route path="/schedule-session" element={<SessionSchedule />} />
            <Route path="/mentor/sessions" element={<MyActiveSessionsPage />} />
            <Route path="/user/sessions" element={<UserActiveSessionsPage />} />
            <Route path="/manage-sessions" element={<SessionManagementPage />} />
            <Route path="/upcoming-sessions" element={<UpcomingSessionsPage />} />

            {/* Add more routes as needed */}

          </Routes>
        </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
