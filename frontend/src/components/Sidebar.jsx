import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2 } from "react-feather"; 
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
import Cookies from "js-cookie";

const Sidebar = ({
  collapsed,
  onToggle,
  savedRoutes,
  onRouteSelect,
  selectedRoute,
  onDeleteRoute,
}) => {
  const navigate = useNavigate();

  // 判断是否登录（可根据你的实际登录逻辑调整）
  const isLoggedIn =
    !!localStorage.getItem("userToken") || !!localStorage.getItem("userData");

  const email = localStorage.getItem("email");

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

  // 获取 username
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/users/username", {
          credentials: "include", // 确保发送 cookies
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.error("Failed to fetch username:", response.statusText);
          setUsername("no user");
          return;
        }
        const text = await response.text();
        console.log("Fetched username:", text);
        if (text.length > 30){
          console.warn("Username is too long, truncating to 30 characters.");
          setUsername("no user");
        }else{
          setUsername(text || "no user");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("error");
      }
    };

    if (isLoggedIn) {
      fetchUsername();
    }
  }, [isLoggedIn]);

  // 处理登出功能
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      console.log("User logged out");

      // 清除可能的用户数据（如果有的话）
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("selectedCity");
      localStorage.removeItem("username"); // 登出时清除 username

      // 清除 cookies
      Cookies.remove("tripId");
      Cookies.remove("currentCity");
      Cookies.remove("placesByDay");
      Cookies.remove("startDate");

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
            <div className="flex flex-col items-start">
              <h3 className="font-semibold text-gray-800">
                {isLoggedIn && username ? username : "Travel Explorer"}
              </h3>
              <p className="text-sm text-gray-500">
                {isLoggedIn && email ? email : "Guest Mode"}
              </p>
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
                <div className="space-y-2 max-h-[31.5rem] overflow-y-auto" id="saved-routes">
                {isLoggedIn ? (
                  savedRoutes.length > 0 ? (
                savedRoutes.map((route) => (
                  <div
                key={route.id}
                onClick={() => {
                    onRouteSelect(route);
                    setTimeout(() => {
                  window.location.reload();
                }, 50); // 1000 ms = 1 second
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedRoute?.id === route.id
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
                  >
                <div className="text-xs text-gray-500 mb-1 ">
                <span className="font-semibold">Trip Name:</span> {route.name || "No Name"}
                <ul className="ml-4 mt-1 space-y-1 list-none">
                  {route.places.map((place, idx) => {
                    const prevPlanDate = idx > 0 ? route.places[idx - 1].planDate : null;
                    const showDivider = idx > 0 && place.planDate !== prevPlanDate;
                    // Generate a unique key for each list item
                    const key = `${place.place_id || place.placeId || "noid"}-${place.planDate || "noplan"}-${place.visitOrder || idx}`;

                    return (
                      <React.Fragment key={key}>
                        {showDivider && (
                          <li>
                            <hr className="my-1 border-gray-300" />
                          </li>
                        )}
                        <li className="pl-1 text-left">
                          <span className="font-semibold">#{place.visitOrder}</span>
                          {place.planDate && (
                            <span className="ml-2 text-gray-400">[{place.planDate}]</span>
                          )}
                          <span className="ml-2">{place.name}</span>
                          <span className="ml-2 text-gray-400">
                            ({place.address || "No address"})
                          </span>
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
                </div>
                {/* Show startDate, days, city name, and plan_date */}
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <span className="mr-3">
          <button
            className="ml-2 text-red-500 hover:text-red-700"
            onClick={e => {
              e.stopPropagation(); // Prevent selecting the route when deleting
              onDeleteRoute(route.id, route.tripId);
            }}
            title="Delete this trip"
          >
            <Trash2 size={16} />
          </button>
          </span>
            {route.startDate && (
              <span className="mr-3">
          <span className="font-semibold">Start:</span> {route.startDate}
              </span>
            )}
          <span className="mr-3">
          <span className="font-semibold">Days:</span> {route.days}
          </span>
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
