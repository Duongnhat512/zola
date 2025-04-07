import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile/Profile";
import { decodedToken } from "./services/UserService";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoading } from "./redux/UserSlice";

function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await decodedToken();
          if (res?.user) {
            dispatch(login(res.user));
          }
        } catch (err) {
          console.error("Token không hợp lệ hoặc đã hết hạn.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      dispatch(setLoading(false)); // Kết thúc loading
    };

    initAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="loader"></div>
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