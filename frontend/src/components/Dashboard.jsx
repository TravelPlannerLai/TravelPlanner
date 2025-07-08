import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MapArea from "./MapArea";

const Dashboard = () => {
  // 全局状态管理
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDays, setSelectedDays] = useState("5days");
  const [currentCity, setCurrentCity] = useState(() => {
    return Cookies.get("currentCity") || "Paris";
  });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);

  const location = useLocation();

  // 监听从城市选择页面返回的数据
  useEffect(() => {
    if (location.state?.selectedCity) {
      setCurrentCity(location.state.selectedCity);
      Cookies.set("currentCity", location.state.selectedCity, { expires: 7 });
      console.log("城市已更新为:", location.state.selectedCity);

      // 清除路由状态，避免重复触发
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetch("/api/trips", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        // 假设 data 是 trips 数组
        setSavedRoutes(data);
      });
  }, []);

  // 明确定义切换函数
  const handleSidebarToggle = () => {
    console.log("Toggling sidebar, current state:", sidebarCollapsed);
    setSidebarCollapsed((prev) => !prev);
  };

  // 处理路线选择
  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setSelectedDays(`${route.days}days`);
  };

  // 处理新路线保存
  const handleSaveRoute = (routeData) => {
    const newRoute = {
      id: Date.now(),
      name: routeData.name,
      days: routeData.days,
      attractions: routeData.attractions,
    };
    setSavedRoutes([...savedRoutes, newRoute]);
  };

  // 处理城市更改
  const handleCityChange = (newCity) => {
    setCurrentCity(newCity);
    console.log("城市已更改为:", newCity);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        savedRoutes={savedRoutes}
        onRouteSelect={handleRouteSelect}
        selectedRoute={selectedRoute}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <TopBar
          currentCity={currentCity}
          selectedDays={selectedDays}
          onCityChange={handleCityChange}
          onDaysChange={setSelectedDays}
          selectedRoute={selectedRoute}
        />

        {/* 地图区域 - 恢复完整的 MapArea */}
        <MapArea
          currentCity={currentCity}
          selectedDays={selectedDays}
          selectedRoute={selectedRoute}
          onSaveRoute={handleSaveRoute}
        />
      </div>
    </div>
  );
};

export default Dashboard;
