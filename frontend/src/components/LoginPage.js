import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // e.preventDefault();
    // // 后端API登录接口
    // try {
    //     const response = await fetch('/api/login', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email, password }),
    //     });
    //     const data = await response.json();
    //     if (data.success) {
    //         alert('Welcome!');
    //     } else {
    //         alert('Login failed. check your accout or password');
    //     }
    // } catch (error) {
    //     console.error('Error', error);
    // }
    e.preventDefault();
    // 直接跳转到 PreviousPlan 页面
    alert("登录成功！");
    navigate("/previous-plan");
  };

  const handleGuestMode = () => {
    // Navigate to the SelectCity page
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
        <button className="guestModeButton" onClick={handleGuestMode}>
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
