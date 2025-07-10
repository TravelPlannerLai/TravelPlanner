import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MapArea from "./MapArea";
import { calculateDays } from "../utils/dateUtils";

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
    async function fetchTripsWithPlaces() {
      try {
        const tripsRes = await fetch("/api/trips", { credentials: "include" });
        const trips = await tripsRes.json();

        // Fetch all day plans in parallel
        const tripsWithPlaces = await Promise.all(
          (Array.isArray(trips) ? trips : []).map(async (trip) => {
            const dayPlansRes = await fetch(
              `/api/dayPlans/trip/${trip.tripId}/full-itinerary`,
              { credentials: "include" }
            );
            const dayPlans = await dayPlansRes.json();

            // Flatten all POIs for this trip, preserving day info if needed
            const places = [];
            dayPlans.forEach((dayPlan) => {
              (dayPlan.pois || []).forEach((poi) => {
                places.push({
                  name: poi.name,
                  lat: poi.lat,
                  lng: poi.lng,
                  address: poi.formattedAddress,
                  visitOrder: poi.visitOrder, // 保留访问顺序
                  place_id: poi.place_id, // 确保有唯一标识符
                  planDate: dayPlan.planDate, // 关联计划日期
                  ...poi,
                });
              });
            });

            return {
              ...trip,
              days: dayPlans.length,
              places,
              startDate: trip.startDate,
              cityId: trip.cityId,
              tripId: trip.tripId,
              name: trip.name || `Trip at (${trip.startDate || "Unknown Date"})`, // 自动生成名称
            };
          })
        );

        setSavedRoutes(tripsWithPlaces);
      } catch (err) {
        console.error("Error fetching trips or day plans:", err);
        setSavedRoutes([]);
      }
    }

    fetchTripsWithPlaces();
  }, []);

  // 新增：获取天数
  const tripDays =
    location.state?.startDate && location.state?.endDate
      ? calculateDays(location.state.startDate, location.state.endDate)
      : 10; // 默认10天

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
  const onSaveRoute = (routeData) => {
    const newRoute = {
      id: Date.now(), // 使用当前时间戳作为唯一ID
      days: routeData.days,
      startDate: routeData.startDate || new Date().toISOString().split("T")[0],
      cityId: routeData.cityId || null, // 如果有 cityId 则使用它，否则为 null
      tripId: routeData.tripId || null, // 如果有 tripId 则使用它，否则为 null
      places: Array.isArray(routeData.places) ? routeData.places : [], // 确保 places
      name: routeData.name || `Trip at (${routeData.startDate || new Date().toISOString().split("T")[0]})`, // 自动生成名称
    };
    console.log("Saving new route:", newRoute);
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
          onSaveRoute={onSaveRoute}
          tripDays={tripDays} // 传递天数
        />
      </div>
    </div>
  );
};

export default Dashboard;
