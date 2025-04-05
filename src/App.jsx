import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <Router>
      {/* <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white"> */}
      {/* <nav className="p-4 flex justify-between bg-gray-200 dark:bg-gray-800">
          <div>
            <Link to="/" className="mr-4">
              Home
            </Link>
            <Link to="/about">About</Link>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav> */}
      {/* </div> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
