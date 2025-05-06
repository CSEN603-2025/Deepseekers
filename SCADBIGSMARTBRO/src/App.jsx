import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentHomePage from "./pages/StudentHomePage";
import EditStudentProfile from "./pages/EditStudentProfile";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentInternshipsPage from "./pages/StudentInternshipsPage";
import StudentAssessmentsPage from "./pages/StudentAssessmentsPage";
import NavigationBar from "./components/NavigationBar";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashBoard from "./pages/CompanyDashBoard";

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
        />
        <Route
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
          path="/student/assessments"
          element={
            <>
              <NavigationBar />
              <main className="main-content">
                <StudentAssessmentsPage />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
