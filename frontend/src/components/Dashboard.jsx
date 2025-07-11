import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();

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
            console.log("Trip places:", places);

            return {
              ...trip,
              days: dayPlans.length,
              places,
              startDate: trip.startDate,
              cityId: trip.cityId,
              tripId: trip.tripId,
              name: trip.name || `Trip at ${trip.startDate || "Unknown Date"}`, // 自动生成名称
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
  const handleRouteSelect = async (route) => {
    setSelectedRoute(route);
    setSelectedDays(`${route.days}days`);
    
    console.log("route.places:", route.places);
    // Build placeIdsByDay from route.places
    const placeIdsByDay = (route.places || []).reduce((acc, place) => {
      const day = place.planDate || "unknown";
      const id = place.place_id || place.poiId;
      if (id) {
        if (!acc[day]) acc[day] = [];
        acc[day].push(place.place_id);
      }
      return acc;
    }, {});

    // Set the cookie
    Cookies.set(
      "placesByDay",
      JSON.stringify({ placeIdsByDay }),
      { expires: 7 }
    );
    console.log("Places by day set in cookies:", placeIdsByDay);
    // Set tripId and currentCity cookies
    if (route.tripId) {
      Cookies.set("tripId", route.tripId, { expires: 7 });
      console.log("Trip ID set in cookies:", route.tripId);
    }

    const city = await fetch(`/api/city/id/${route.cityId}`,{ credentials: "include" });
    const cityData = await city.json();
    setCurrentCity(cityData.name || "Unknown City");
    Cookies.set("currentCity", cityData.name || "Unknown City", { expires: 7 });
    console.log("城市已设置为:", cityData.name || "Unknown City");
    Cookies.set("startDate", route.startDate || new Date().toISOString().split("T")[0], { expires: 7 });
    console.log("Start date set in cookies:", route.startDate || new Date().toISOString().split("T")[0]);
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
      name: routeData.name || `Trip at ${routeData.startDate || new Date().toISOString().split("T")[0]}`, // 自动生成名称
    };
    console.log("Saving new route:", newRoute);
    setSavedRoutes([...savedRoutes, newRoute]);
  };

  // 处理城市更改
  const handleCityChange = (newCity) => {
    setCurrentCity(newCity);
    console.log("城市已更改为:", newCity);
  };

  // 新增：删除路线
  const handleDeleteRoute = async (routeId, tripId) => {
    // 可选：后端删除
    if (tripId) {
      try {
        await fetch(`/api/trips/${tripId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to delete trip from backend:", err);
      }
    }
    setSavedRoutes((prev) => prev.filter((route) => route.id !== routeId));
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
    }
    // 检查 cookie 中的 tripId 是否等于被删除的 tripId
    const cookieTripId = Cookies.get("tripId");
    if (cookieTripId && cookieTripId === tripId) {
      Cookies.remove("tripId");
      navigate("/select_city", {
        state: {
          fromMain: true,
          currentCity: Cookies.get("currentCity") || "Paris",
        },
      });
      return;
    }
    window.location.reload();
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
        onDeleteRoute={handleDeleteRoute}
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
