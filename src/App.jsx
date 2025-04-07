import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile/Profile";
import { setAuthToken } from "./utils/customize-axios";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State để quản lý trạng thái loading

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(storedMode);

    if (storedMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("Setting auth token...");
      setAuthToken(token);
    }
    setIsLoading(false); // Kết thúc loading sau khi xử lý xong
  }, []);

  if (isLoading) {
    // Hiển thị hiệu ứng loading khi đang xử lý
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="loader"></div> {/* Thêm hiệu ứng loader */}
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;