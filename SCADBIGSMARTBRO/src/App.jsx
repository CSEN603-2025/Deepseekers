import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentHomePage from "./pages/StudentHomePage";
import EditStudentProfile from "./pages/EditStudentProfile";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentInternshipsPage from "./pages/StudentInternshipsPage";
import StudentReportsPage from "./pages/StudentReportsPage";
import NavigationBar from "./components/NavigationBar";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashBoard from "./pages/CompanyDashBoard";
import ScadHomePage from "./pages/ScadHomePage";
import ScadNavigationBar from "./components/ScadNavigationBar";
import ScadCompanyApplications from "./pages/ScadCompanyApplications";
import ScadReportsPage from "./pages/ScadReportsPage";
import FacultyHomePage from "./pages/FacultyHomePage";
import FacultyReportsPage from "./pages/FacultyReportsPage";
import FacultyNavigationBar from "./components/FacultyNavigationBar";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/student/home"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentHomePage />
              </main>
            </>
          }
        />
        <Route
          path="/student/profile"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentProfilePage />
              </main>
            </>
          }
        />
        <Route
          path="/student/edit-profile"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <EditStudentProfile />
              </main>
            </>
          }
        />        <Route
          path="/student/internships"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentInternshipsPage />
              </main>
            </>
          }
        />
        <Route
          path="/student/reports"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentReportsPage />
              </main>
            </>
          }
        />
        <Route path="/register" element={<CompanyRegister />} /> 
        <Route path="/company/dashboard" element={<CompanyDashBoard />} />
        <Route
          path="/scad/home"
          element={
            <>
              <ScadNavigationBar />
              <main className="main-content">
                <ScadHomePage />
              </main>
            </>
          }
        />
        <Route path="/scad/company-applications" element={
          <>
          <ScadNavigationBar />
          <main className="main-content">
          <ScadCompanyApplications />
          </main>
          </>}
          />
        <Route path="/scad/reports" element={
          <>
          <ScadNavigationBar />
          <main className="main-content">
          <ScadReportsPage />
          </main>
          </>}
          />
        {/* Faculty Routes */}
        <Route
          path="/faculty/home"
          element={
            <>
              <FacultyNavigationBar />
              <main className="main-content">
                <FacultyHomePage />
              </main>
            </>
          }
        />
        <Route
          path="/faculty/reports"
          element={
            <>
              <FacultyNavigationBar />
              <main className="main-content">
                <FacultyReportsPage />
              </main>
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;