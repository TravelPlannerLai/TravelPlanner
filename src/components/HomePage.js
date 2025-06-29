import React from "react";

const HomePage = () => {
  const pages = [
    { path: "/login", label: "Login Page" },
    { path: "/register", label: "Register Page" },
    { path: "/previous_plan", label: "Previous Plan Page" },
    { path: "/main_page", label: "Main Page" },
    { path: "/select_city", label: "Select City Page" },
    { path: "/chat", label: "Chat Page" }, // ✅ 新增页面
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">🌟 Welcome to the Main Page</h1>
      <div className="space-y-4">
        {pages.map((page, index) => (
          <a
            key={index}
            href={page.path}
            className="block text-lg text-blue-600 hover:underline hover:text-blue-800 transition"
          >
            ➤ {page.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
