import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Route,
  // Map,
  // MessageSquare,
  // Heart,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = ({
  collapsed,
  onToggle,
  savedRoutes,
  onRouteSelect,
  selectedRoute,
}) => {
  const navigate = useNavigate();

  // 判断是否登录（可根据你的实际登录逻辑调整）
  const isLoggedIn =
    !!localStorage.getItem("userToken") || !!localStorage.getItem("userData");

  // 添加调试用的点击处理函数
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle button clicked, current collapsed:", collapsed);
    if (onToggle) {
      onToggle();
    } else {
      console.error("onToggle function not provided");
    }
  };

  // 处理登出功能
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      console.log("User logged out");

      // 清除可能的用户数据（如果有的话）
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("selectedCity");

      // 清除会话数据
      sessionStorage.clear();

      // 跳转到登录页面
      navigate("/", { replace: true });

      // 显示登出成功消息
      setTimeout(() => {
        alert("You have been logged out successfully!");
      }, 100);
    }
  };

  const menuItems = [
    {
      id: "routes",
      label: "My Routes",
      icon: Route,
      type: "menu",
      active: true,
      count: savedRoutes.length,
    },
    // {
    //   id: "maps",
    //   label: "Explore Maps",
    //   icon: Map,
    //   type: "menu",
    // },
    // {
    //   id: "chat",
    //   label: "Travel Assistant",
    //   icon: MessageSquare,
    //   type: "menu",
    // },
    // {
    //   id: "favorites",
    //   label: "Favorites",
    //   icon: Heart,
    //   type: "menu",
    //   count: 12,
    // },
  ];

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-80"
      }`}
    >
      {/* 头部 - 修复切换按钮 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-blue-600">TravelPlanner</h1>
              <p className="text-xs text-gray-500">Discover & Plan</p>
            </div>
          )}
          <button
            onClick={handleToggleClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* 用户信息 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <h3 className="font-semibold text-gray-800">Travel Explorer</h3>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>
          )}
        </div>
      </div>

      {/* 主导航菜单 */}
        <div className="flex-1 py-4">
          {menuItems.map((item) => (
            <div key={item.id} className="px-4 mb-2">
          <button
            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
              item.active
            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
            : "text-gray-600"
            }`}
          >
            <div className="flex items-center">
              <item.icon
            size={20}
            className={`${
              item.active ? "text-blue-600" : "text-gray-500"
            } group-hover:text-blue-600`}
              />
              {!collapsed && (
            <span className="ml-3 font-medium">{item.label}</span>
              )}
            </div>
            {!collapsed && item.count && (
              <span
            className={`px-2 py-1 text-xs rounded-full ${
              item.active
          ? "bg-blue-100 text-blue-600"
          : "bg-gray-100 text-gray-600"
            }`}
              >
            {item.count}
              </span>
            )}
          </button>
            </div>
          ))}

          {/* 保存的路线列表 */}
                {!collapsed && (
                <div className="mt-6 px-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Saved Trips
                </h4>
                <div className="space-y-2 max-h-[31.5rem] overflow-y-auto">
                {isLoggedIn ? (
                  savedRoutes.length > 0 ? (
                savedRoutes.map((route) => (
                  <div
                key={route.id}
                onClick={() => onRouteSelect(route)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedRoute?.id === route.id
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
                  >
                <div className="text-xs text-gray-500 mb-1">
                <span className="font-semibold">Trip ID:</span> {route.tripId || "N/A"}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <div>
                  {(Array.isArray(route.places) ? route.places : []).map((place, idx) => (
                  <li key={place.place_id || idx}>
                    {place.visitOrder}: {place.name} {place.planDate} ({place.address || "No address"})
                
                  </li>
                  ))}
                </div>
                </div>
                {/* Show startDate, days, city name, and plan_date */}
          <div className="flex items-center text-xs text-gray-600 mb-1">
            {route.startDate && (
              <span className="mr-3">
          <span className="font-semibold">Start:</span> {route.startDate}
              </span>
            )}
            {route.days && (
              <span className="mr-3">
          <span className="font-semibold">Days:</span> {route.days}
              </span>
            )}
            {route.cityId && (
              <span className="mr-3">
          <span className="font-semibold">City:</span> {route.cityId}
              </span>
            )}
          </div>
              </div>
            ))
              ) : (
            <div className="text-gray-400 text-sm">
              No saved routes yet.
            </div>
              )
            ) : (
              <div className="text-gray-400 text-sm">
            Please{" "}
            <Link to="/login" className="text-blue-500 underline">
              log in
            </Link>{" "}
            to save your routes
              </div>
            )}
          </div>
            </div>
          )}
        </div>

        {/* 底部设置和登出 */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        {/* Settings 按钮 */}
        <button className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings size={20} />
          {!collapsed && <span className="ml-3 font-medium">Settings</span>}
        </button>

        {/* Logout 按钮 - 现在连接到真实功能 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} className="group-hover:text-red-700" />
          {!collapsed && (
            <span className="ml-3 font-medium group-hover:text-red-700">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
