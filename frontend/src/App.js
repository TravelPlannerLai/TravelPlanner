// 融合后的 App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 从城市选择项目复制过来的组件
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SelectCity from "./components/SelectCity";

// 你的旅行规划器组件
import Dashboard from "./components/Dashboard";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 登录注册流程 */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 城市选择页面 */}
          <Route path="/select_city" element={<SelectCity />} />

          {/* 主应用页面 - 你的旅行规划器 */}
          <Route path="/main" element={<Dashboard />} />

          {/* 兼容性路由 */}
          <Route path="/main_page" element={<Navigate to="/main" replace />} />

          {/* 404页面 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
