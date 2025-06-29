import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    // e.preventDefault();
    // if (password !== confirmPassword) {
    //     alert('Password not match！');
    //     return;
    // }
    // // 后端API注册接口
    // try {
    //     const response = await fetch('/api/register', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email, password }),
    //     });
    //     const data = await response.json();
    //     if (data.success) {
    //         alert('Register success！');
    //     } else {
    //         alert('Fail to register. Please retry');
    //     }
    // } catch (error) {
    //     console.error('Error', error);
    // }
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Confirm your password！");
      return;
    }
    // 直接跳转到 Login 页面
    alert("Register Success！");
    navigate("/login");
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2 className="register-title">Register</h2>
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
        <input
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <div>
          Already a Traveler？<Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
