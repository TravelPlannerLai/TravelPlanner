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

// 完整的城市坐标数据 - 包含美国所有主要城市
const cityCoordinates = {
  // 热门国际城市
  Paris: { lat: 48.8566, lng: 2.3522 },
  London: { lat: 51.5074, lng: -0.1278 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Rome: { lat: 41.9028, lng: 12.4964 },
  Barcelona: { lat: 41.3851, lng: 2.1734 },

  // 美国主要城市
  "New York": { lat: 40.7128, lng: -74.006 },
  "New York City": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Orlando: { lat: 28.5383, lng: -81.3792 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Denver: { lat: 39.7392, lng: -104.9903 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  Dallas: { lat: 32.7767, lng: -96.797 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
  Philadelphia: { lat: 39.9526, lng: -75.1652 },
  "San Diego": { lat: 32.7157, lng: -117.1611 },
  Atlanta: { lat: 33.749, lng: -84.388 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  Portland: { lat: 45.5152, lng: -122.6784 },
  Tampa: { lat: 27.9506, lng: -82.4572 },
  Charlotte: { lat: 35.2271, lng: -80.8431 },
  Detroit: { lat: 42.3314, lng: -83.0458 },
  Minneapolis: { lat: 44.9778, lng: -93.265 },
  Columbus: { lat: 39.9612, lng: -82.9988 },
  Indianapolis: { lat: 39.7684, lng: -86.1581 },
  Cleveland: { lat: 41.4993, lng: -81.6944 },
  Baltimore: { lat: 39.2904, lng: -76.6122 },
  "Washington D.C.": { lat: 38.9072, lng: -77.0369 },
};

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

// Google Maps 组件
const GoogleMapComponent = ({
  currentCity,
  attractions,
  onAttractionClick,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 初始化地图
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const center =
        cityCoordinates[currentCity] || cityCoordinates["New York"];
      console.log(`Initializing map for ${currentCity}:`, center);

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
  }, [currentCity, attractions, onAttractionClick]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

// 主 MapArea 组件
const MapArea = ({ currentCity, selectedDays, selectedRoute, onSaveRoute }) => {
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [routeName, setRouteName] = useState("");

  const attractions = attractionsData[currentCity] || [];

  const handleSaveCurrentRoute = () => {
    if (routeName.trim()) {
      onSaveRoute({
        name: routeName,
        days: parseInt(selectedDays),
        attractions: attractions.length,
      });
      setRouteName("");
      alert("Route saved successfully!");
    }
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
    <div className="flex-1 relative bg-gray-100">
      {/* Google Maps 容器 */}
      <div className="w-full h-full relative">
        <GoogleMapComponent
          currentCity={currentCity}
          attractions={attractions}
          onAttractionClick={setSelectedAttraction}
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

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected attractions:</span>
              <span className="font-medium">{attractions.length} places</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated time:</span>
              <span className="font-medium">2 days</span>
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