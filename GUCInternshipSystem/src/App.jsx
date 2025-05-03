import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentHomePage from "./pages/StudentHomePage";
import StudentProfile from "./pages/StudentProfile";
import NavigationBar from "./components/NavigationBar";
import CompanyRegister from "./pages/CompanyRegister";

import "./App.css";

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
                <StudentProfile />
              </main>
            </>
          }
        />

        <Route path="/register" element={<CompanyRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
