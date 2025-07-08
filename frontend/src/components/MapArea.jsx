import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  Compass,
  MapPin,
  Clock,
  Star,
  Bot,
  Save,
  Navigation,
  Info,
} from "lucide-react";

// 使用你的 Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 景点数据 - 包含多个城市的真实景点
const attractionsData = {
  Paris: [
    {
      id: 1,
      name: "Eiffel Tower",
      type: "landmark",
      icon: "🗼",
      coordinates: { lat: 48.8584, lng: 2.2945 },
      rating: 4.8,
      visitTime: "2-3 hours",
      description: "Iconic iron lattice tower and symbol of Paris",
      category: "Historical",
    },
    {
      id: 2,
      name: "Louvre Museum",
      type: "museum",
      icon: "🏛️",
      coordinates: { lat: 48.8606, lng: 2.3376 },
      rating: 4.9,
      visitTime: "3-4 hours",
      description: "World's largest art museum and historic monument",
      category: "Art & Culture",
    },
    {
      id: 3,
      name: "Notre-Dame Cathedral",
      type: "church",
      icon: "⛪",
      coordinates: { lat: 48.853, lng: 2.3499 },
      rating: 4.7,
      visitTime: "1-2 hours",
      description: "Medieval Catholic cathedral with Gothic architecture",
      category: "Historical",
    },
  ],
  "New York": [
    {
      id: 4,
      name: "Statue of Liberty",
      type: "monument",
      icon: "🗽",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      rating: 4.7,
      visitTime: "2-3 hours",
      description: "Symbol of freedom and democracy",
      category: "Historical",
    },
    {
      id: 5,
      name: "Central Park",
      type: "park",
      icon: "🌳",
      coordinates: { lat: 40.7829, lng: -73.9654 },
      rating: 4.6,
      visitTime: "2-4 hours",
      description: "Large public park in Manhattan",
      category: "Nature",
    },
    {
      id: 6,
      name: "Times Square",
      type: "landmark",
      icon: "🌃",
      coordinates: { lat: 40.758, lng: -73.9855 },
      rating: 4.3,
      visitTime: "1-2 hours",
      description: "Busy commercial intersection and tourist destination",
      category: "Entertainment",
    },
  ],
  "New York City": [
    {
      id: 4,
      name: "Statue of Liberty",
      type: "monument",
      icon: "🗽",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      rating: 4.7,
      visitTime: "2-3 hours",
      description: "Symbol of freedom and democracy",
      category: "Historical",
    },
    {
      id: 5,
      name: "Central Park",
      type: "park",
      icon: "🌳",
      coordinates: { lat: 40.7829, lng: -73.9654 },
      rating: 4.6,
      visitTime: "2-4 hours",
      description: "Large public park in Manhattan",
      category: "Nature",
    },
    {
      id: 6,
      name: "Times Square",
      type: "landmark",
      icon: "🌃",
      coordinates: { lat: 40.758, lng: -73.9855 },
      rating: 4.3,
      visitTime: "1-2 hours",
      description: "Busy commercial intersection and tourist destination",
      category: "Entertainment",
    },
  ],
  Orlando: [
    {
      id: 7,
      name: "Walt Disney World",
      type: "theme_park",
      icon: "🏰",
      coordinates: { lat: 28.3852, lng: -81.5639 },
      rating: 4.8,
      visitTime: "Full day",
      description: "The most magical place on earth",
      category: "Entertainment",
    },
    {
      id: 8,
      name: "Universal Studios",
      type: "theme_park",
      icon: "🎬",
      coordinates: { lat: 28.4743, lng: -81.4677 },
      rating: 4.7,
      visitTime: "Full day",
      description: "Movie-themed amusement park",
      category: "Entertainment",
    },
    {
      id: 9,
      name: "Lake Eola Park",
      type: "park",
      icon: "🦢",
      coordinates: { lat: 28.5421, lng: -81.3737 },
      rating: 4.5,
      visitTime: "1-2 hours",
      description: "Beautiful urban park with lake and swan boats",
      category: "Nature",
    },
  ],
  "Los Angeles": [
    {
      id: 10,
      name: "Hollywood Sign",
      type: "landmark",
      icon: "🎭",
      coordinates: { lat: 34.1341, lng: -118.3215 },
      rating: 4.4,
      visitTime: "1-2 hours",
      description: "Iconic landmark overlooking Hollywood",
      category: "Entertainment",
    },
    {
      id: 11,
      name: "Santa Monica Pier",
      type: "pier",
      icon: "🎡",
      coordinates: { lat: 34.0082, lng: -118.4987 },
      rating: 4.3,
      visitTime: "2-3 hours",
      description: "Famous pier with amusement park and beach",
      category: "Entertainment",
    },
  ],
  London: [
    {
      id: 12,
      name: "Big Ben",
      type: "landmark",
      icon: "🕐",
      coordinates: { lat: 51.4994, lng: -0.1245 },
      rating: 4.7,
      visitTime: "1 hour",
      description: "Iconic clock tower of the Palace of Westminster",
      category: "Historical",
    },
    {
      id: 13,
      name: "Tower Bridge",
      type: "bridge",
      icon: "🌉",
      coordinates: { lat: 51.5055, lng: -0.0754 },
      rating: 4.6,
      visitTime: "1-2 hours",
      description: "Famous bascule and suspension bridge",
      category: "Historical",
    },
  ],
};

export async function fetchCityCoordinates(cityName, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    // You can also extract country if needed
    const countryComponent = data.results[0].address_components.find(c => c.types.includes("country"));
    const country = countryComponent ? countryComponent.long_name : "Unknown";
    return { lat, lng, country };
  } else {
    throw new Error("City not found");
  }
}

// Google Maps 组件
const GoogleMapComponent = ({
  currentCity,
  attractions,
  onAttractionClick,
  places,
  addPlace,
  deletePlace,
  updatePlaceName,
  addCityToBackend,
  addPOIToBackend,
  cityCoordinates,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 初始化地图
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current || !window.google.maps) return;
      const center = cityCoordinates[currentCity] || cityCoordinates["Paris"];
      if (!center) {
        // Coordinates not ready yet, skip map init
        return;
      }
      console.log(`Initializing map for ${currentCity}:`, center);
      addCityToBackend({
        name: currentCity,
        country: center.country || "Unknown",
        lat: center.lat,
        lon: center.lng,
      });

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      mapInstanceRef.current = map;

      // 清除旧标记
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 添加景点标记
      if (attractions && attractions.length > 0) {
        attractions.forEach((attraction) => {
          const marker = new window.google.maps.Marker({
            position: attraction.coordinates,
            map: map,
            title: attraction.name,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="white" stroke="#3B82F6" stroke-width="2"/>
                  <text x="20" y="28" text-anchor="middle" font-size="16">${attraction.icon}</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(40, 40),
            },
          });

          marker.addListener("click", () => {
            onAttractionClick(attraction);
          });

          markersRef.current.push(marker);
        });
      }
      if (places && places.length > 0) {
        places.forEach((place, idx) => {
          const marker = new window.google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map: map,
            title: place.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // or use a custom icon
            },
          });
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div>
                <input id="edit-name-${idx}" value="${place.name.replace(
              /"/g,
              "&quot;"
            )}" style="font-weight:bold;width:140px;margin-bottom:4px;padding:2px 4px;border:1px solid #ccc;border-radius:4px;" />
                <div><strong>Address:</strong> ${
                  place.address || place.formatted_address || ""
                }</div>
                <div><strong>Types:</strong> ${
                  Array.isArray(place.types)
                    ? place.types.join(", ")
                    : place.types || ""
                }</div>
                <div><strong>Rating:</strong> ${
                  place.rating !== null && place.rating !== undefined
                    ? place.rating
                    : "N/A"
                }</div>
                <div><strong>Opening Hours:</strong> ${
                  place.opening_hours
                    ? place.opening_hours.open_now
                      ? "Open Now"
                      : "Closed"
                    : "N/A"
                }</div>
                <button id="delete-place-${idx}" style="margin-top:5px;color:#fff;background:#f87171;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Delete</button>
              </div>
            `,
          });
          marker.addListener("click", () => {
            infoWindow.open(map, marker);
            // Attach delete handler after InfoWindow DOM is rendered
            window.google.maps.event.addListenerOnce(
              infoWindow,
              "domready",
              () => {
                const btn = document.getElementById(`delete-place-${idx}`);
                if (btn) {
                  btn.onclick = () => {
                    deletePlace(idx);
                    infoWindow.close();
                  };
                }
                const input = document.getElementById(`edit-name-${idx}`);
                if (input) {
                  input.onchange = (e) => {
                    updatePlaceName(idx, e.target.value);
                  };
                }
              }
            );
          });
          markersRef.current.push(marker);
        });
      }

      map.addListener("click", (e) => {
        if (!window.google || !mapRef.current || !window.google.maps) return;
        const service = new window.google.maps.places.PlacesService(map);

        // First, use nearbySearch to find the closest place to the click
        service.nearbySearch(
          {
            location: e.latLng,
            type: "point_of_interest", // or use "establishment" for more general places
            radius: 50, // meters
          },
          (results, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results[0]
            ) {
              const placeSummary = results[0];
              // Now get full details
              service.getDetails(
                {
                  placeId: placeSummary.place_id,
                  fields: [
                    "place_id",
                    "name",
                    "formatted_address",
                    "vicinity",
                    "types",
                    "geometry",
                    "opening_hours",
                    "rating",
                    "user_ratings_total",
                    "photos",
                    "price_level",
                  ],
                },
                (details, status) => {
                  if (
                    status ===
                      window.google.maps.places.PlacesServiceStatus.OK &&
                    details
                  ) {
                    const newPlace = {
                      name: details.name,
                      address:
                        details.formatted_address ||
                        details.vicinity ||
                        "No address",
                      lat: details.geometry.location.lat(),
                      lng: details.geometry.location.lng(),
                      place_id: details.place_id,
                      types: details.types || [],
                      price_level: details.price_level ?? null,
                      rating: details.rating ?? null,
                      user_ratings_total: details.user_ratings_total ?? null,
                      opening_hours: details.opening_hours
                        ? {
                            open_now: details.opening_hours.open_now,
                            weekday_text: details.opening_hours.weekday_text,
                          }
                        : null,
                      photo_reference:
                        details.photos && details.photos.length > 0
                          ? details.photos[0].getUrl()
                          : null,
                    };

                    addPlace(newPlace);
                    addPOIToBackend(currentCity, newPlace);
                  }
                }
              );
            } else {
              // fallback if no place found
              addPlace({
                name: "Selected Location",
                address: `Lat: ${e.latLng.lat().toFixed(6)}, Lng: ${e.latLng
                  .lng()
                  .toFixed(6)}`,
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                place_id: null,
                types: [],
                price_level: null,
                rating: null,
                user_ratings_total: null,
                opening_hours: null,
                photo_reference: null,
              });
            }
          }
        );
      });
    };

    // 检查 Google Maps API 是否已加载
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // 加载 Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [
    currentCity,
    attractions,
    onAttractionClick,
    addPlace,
    places,
    deletePlace,
    updatePlaceName,
    addCityToBackend,
    addPOIToBackend,
    cityCoordinates,
  ]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

// 主 MapArea 组件
const MapArea = ({ currentCity, selectedDays, selectedRoute, onSaveRoute }) => {
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [routeName, setRouteName] = useState("");
  const [currentDay, setCurrentDay] = useState(1);
  const [placesByDay, setPlacesByDay] = useState({ 1: [] });

  const handleDayChange = (e) => {
    setCurrentDay(Number(e.target.value));
    setSelectedAttraction(null);
  };

  const [places, setPlaces] = useState([]);
  const [cityCoordinates, setCityCoordinates] = useState({});

  useEffect(() => {
    async function getCoordinates() {
      if (!cityCoordinates[currentCity]) {
        try {
          const coords = await fetchCityCoordinates(currentCity, GOOGLE_MAPS_API_KEY);
          setCityCoordinates(prev => ({
            ...prev,
            [currentCity]: coords,
          }));
        } catch (e) {
          console.error("Failed to fetch city coordinates:", e);
        }
      }
    }
    getCoordinates();
  }, [currentCity, cityCoordinates]);

  // Wrap `addPlace` in useCallback
  const addPlace = React.useCallback(
    (place) => {
      setPlacesByDay((prev) => {
        const dayPlaces = prev[currentDay] || [];
        if (dayPlaces.length < 8) {
          return { ...prev, [currentDay]: [...dayPlaces, place] };
        } else {
          alert("Maximum of 8 places allowed per day.");
          return prev;
        }
      });
    },
    [currentDay]
  );

  const deletePlace = React.useCallback(
    (idx) => {
      setPlacesByDay((prev) => {
        const dayPlaces = prev[currentDay] || [];
        return { ...prev, [currentDay]: dayPlaces.filter((_, i) => i !== idx) };
      });
    },
    [currentDay]
  );

  const updatePlaceName = React.useCallback(
    (idx, newName) => {
      setPlacesByDay((prev) => {
        const dayPlaces = prev[currentDay] || [];
        return {
          ...prev,
          [currentDay]: dayPlaces.map((p, i) =>
            i === idx ? { ...p, name: newName } : p
          ),
        };
      });
    },
    [currentDay]
  );

  const addCityToBackend = async (city) => {
    try {
      const response = await fetch("/api/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(city),
      });
      if (response.status === 409) {
        console.warn('City already exists');
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to add city");
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log("City added:", data);
      return data;
    } catch (error) {
      console.error("Error adding city:", error);
      return null;
    }
  };

  const addPOIToBackend = async (cityName, place) => {
    try {
      const response = await fetch(`/api/pois?cityName=${cityName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: place.place_id,
          name: place.name,
          formattedAddress: place.address || place.formatted_address,
          types: place.types, // Should be an array or JSON
          lat: place.lat,
          lng: place.lng,
          openingHours: place.opening_hours, // Should be an object or JSON
          rating: place.rating,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add POI");
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log("POI added:", data);
      return data;
    } catch (error) {
      console.error("Error adding POI:", error);
      return null;
    }
  };

  const attractions = placesByDay[currentDay] || [];

  const handleSaveCurrentRoute = async () => {
    // 统计有图钉的天数和天号
    const daysWithPins = Object.entries(placesByDay).filter(
      ([day, pins]) => pins && pins.length > 0
    );
    if (daysWithPins.length === 0) {
      alert("请至少在一天放置一个景点后再保存路线！");
      return;
    }
    // 获取 cityId
    let cityId = null;
    let cityQueryName = currentCity;
    if (cityQueryName === "New York City") cityQueryName = "New York";
    try {
      const cityRes = await fetch(
        `/api/city/name/${encodeURIComponent(cityQueryName)}`
      );
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        cityId = cityData.cityId || cityData.city_id || cityData.id;
      }
    } catch (e) {
      alert("获取城市ID失败");
      return;
    }
    if (!cityId) {
      alert("未找到当前城市的ID，无法保存");
      return;
    }
    // 创建 trip
    const startDate = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const days = daysWithPins.length;
    let tripId = null;
    try {
      const tripRes = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cityId, startDate, days }),
      });
      if (tripRes.ok) {
        tripId = await tripRes.text();
        // 可能是 uuid 字符串
        if (tripId.startsWith('"') && tripId.endsWith('"'))
          tripId = tripId.slice(1, -1);
      }
    } catch (e) {
      alert("创建行程(trip)失败");
      return;
    }
    if (!tripId) {
      alert("未能成功创建行程(trip)");
      return;
    }
    // 依次为每个有图钉的 day 创建 day plan
    for (const [dayStr, pins] of daysWithPins) {
      const dayNumber = Number(dayStr);
      // 计算 plan_date = start_date + (day_number-1)
      const planDateObj = new Date(startDate);
      planDateObj.setDate(planDateObj.getDate() + (dayNumber - 1));
      const planDate = planDateObj.toISOString().slice(0, 10);
      // 组装 pois
      const pois = pins.map((p, idx) => ({
        cityId,
        placeId: p.place_id || p.placeId || null,
        name: p.name,
        formattedAddress: p.address || p.formattedAddress || "",
        types: p.types || [],
        lat: p.lat,
        lng: p.lng,
        openingHours: p.opening_hours || p.openingHours || null,
        rating: p.rating || null,
        userRatingsTotal: p.user_ratings_total || p.userRatingsTotal || null,
        photoReference: p.photo_reference || p.photoReference || null,
        visitOrder: idx + 1,
      }));
      const dayPlanReq = {
        dayNumber,
        planDate,
        pois,
      };
      try {
        const planRes = await fetch(
          `/api/dayPlans/save_route?tripId=${tripId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(dayPlanReq),
          }
        );
        if (!planRes.ok) {
          throw new Error("保存 day plan 失败");
        }
      } catch (e) {
        alert(`保存第${dayNumber}天路线失败`);
        return;
      }
    }
    alert("路线已成功保存到数据库！");
    // 可选：清空本地数据或刷新 saved routes
  };

  // API Key 检查
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex-1 flex items-center justify-center bg-yellow-50">
        <div className="text-center p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            Google Maps API Key Required
          </h3>
          <p className="text-sm text-yellow-700">
            Please add your Google Maps API key to the .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Google Maps 容器 */}
      <div className="w-full h-full relative">
        <GoogleMapComponent
          currentCity={currentCity}
          attractions={attractions}
          onAttractionClick={setSelectedAttraction}
          places={placesByDay[currentDay] || []}
          addPlace={addPlace}
          deletePlace={deletePlace}
          updatePlaceName={updatePlaceName}
          addCityToBackend={addCityToBackend}
          addPOIToBackend={addPOIToBackend}
          cityCoordinates={cityCoordinates}
        />

        {/* 调试信息 - 临时显示 */}
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg text-xs z-20">
          <div>
            <strong>Current City:</strong> {currentCity}
          </div>
          <div>
            <strong>Coordinates:</strong>{" "}
            {JSON.stringify(cityCoordinates[currentCity])}
          </div>
          <div>
            <strong>Attractions:</strong> {attractions.length}
          </div>
        </div>

        {/* 地图控制按钮 */}
        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden z-10">
          <button className="p-3 hover:bg-gray-50 border-b border-gray-200 text-gray-600 transition-colors">
            <Plus size={18} />
          </button>
          <button className="p-3 hover:bg-gray-50 border-b border-gray-200 text-gray-600 transition-colors">
            <Minus size={18} />
          </button>
          <button className="p-3 hover:bg-gray-50 border-b border-gray-200 text-gray-600 transition-colors">
            <Compass size={18} />
          </button>
          <button className="p-3 hover:bg-gray-50 text-gray-600 transition-colors">
            <Navigation size={18} />
          </button>
        </div>

        {/* 景点详情面板 */}
        {selectedAttraction && (
          <div className="absolute top-20 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedAttraction.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {selectedAttraction.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedAttraction.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star
                    size={16}
                    className="text-yellow-500"
                    fill="currentColor"
                  />
                  <span className="font-medium">
                    {selectedAttraction.rating}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">
                    {selectedAttraction.visitTime}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700">
                {selectedAttraction.description}
              </p>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  Add to Route
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Info size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 路线规划工具 */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-md z-10">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <MapPin className="mr-2 text-blue-600" size={20} />
            Route Planner
          </h3>
          <div className="mb-3">
            <label htmlFor="day-select" className="mr-2">
              Day:
            </label>
            <select
              id="day-select"
              value={currentDay}
              onChange={handleDayChange}
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{`Day ${d}`}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected attractions:</span>
              <span className="font-medium">{attractions.length} places</span>
            </div>
            <div className="border-t pt-3">
              <input
                type="text"
                placeholder="Name your route..."
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveCurrentRoute}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Save size={16} className="mr-1" />
                  Save Route
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI旅行助手 */}
        {showAIAssistant && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Bot className="mr-2 text-purple-600" size={20} />
                Travel Assistant
              </h3>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  👋 Hi! I'm your AI travel assistant. I can help you:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Find the best routes between attractions</li>
                  <li>• Suggest optimal visiting times</li>
                  <li>• Recommend nearby restaurants</li>
                  <li>• Check weather conditions</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm font-medium">
                  🗺️ Plan Route
                </button>
                <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium">
                  🍽️ Find Food
                </button>
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium">
                  ☀️ Weather
                </button>
                <button className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm font-medium">
                  💡 Tips
                </button>
              </div>

              <div className="border-t pt-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapArea;
