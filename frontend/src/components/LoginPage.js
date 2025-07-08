import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. 准备 form-urlencoded 格式
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      // 2. 调用后端表单登录接口
      const response = await fetch("http://localhost:8080/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        // 登录成功
        alert("登录成功！");
        localStorage.setItem("userToken", "true");
        navigate("/select_city");
      } else {
        // 4. 登录失败提示
        alert("登录失败，检查账号或密码");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("网络错误，请稍后重试");
    }
  };

  const handleGuestMode = () => {
    navigate("/select_city");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <br />
        <button
          type="button"
          className="guestModeButton"
          onClick={handleGuestMode}
        >
          Use Guest Mode
        </button>
        <div>
          New traveler？<Link to="/register">Register Now</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
