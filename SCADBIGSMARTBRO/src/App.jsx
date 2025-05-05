import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentHomePage from "./pages/StudentHomePage";
import StudentEditProfilePage from "./pages/StudentEditProfilePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import NavigationBar from "./components/NavigationBar";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashBoard from "./pages/CompanyDashBoard";
import FacultyAcademicDashboardPage from "./pages/FacultyAcademicDashboardPage";
import FacultyNavigationBar from "./components/FacultyNavigationBar";
import FacultyApplicationReviewPage from "./pages/FacultyApplicationsPage";
import FacultyEditProfilePage from "./pages/FacultyEditProfilePage";
import StudentInternshipDetailsPage from "./pages/StudentInternshipDetailsPage";
import StudentHomePageWithApprovedApplications from "./pages/StudentHomePageWithApprovedApplications";

import "./App.css";
import ScadHomePage from "./pages/ScadHomePage";
import ScadNavigationBar from "./components/ScadNavigationBar";
import ScadCompanyApplications from "./pages/ScadCompanyApplications";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
          path="/student/approved-applications"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentHomePageWithApprovedApplications />
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
                <StudentEditProfilePage />
              </main>
            </>
          }
        />
        <Route
          path="/student/internship-details/:applicationId"
          element={
            <main className="main-content">
              <StudentInternshipDetailsPage />
            </main>
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
        {/* Faculty Academic Routes */}
        <Route
          path="/faculty/dashboard"
          element={
            <>
              <FacultyNavigationBar />
              <main className="main-content">
                <FacultyAcademicDashboardPage />
              </main>
            </>
          }
        />
        <Route
          path="/faculty/applications"
          element={
            <>
              <FacultyNavigationBar />
              <main className="main-content">
                <FacultyApplicationReviewPage />
              </main>
            </>
          }
        />
        <Route
          path="/faculty/edit-profile"
          element={
            <>
              <FacultyNavigationBar />
              <main className="main-content">
                <FacultyEditProfilePage />
              </main>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
