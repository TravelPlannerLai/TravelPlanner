import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Compass,
  MapPin,
  Clock,
  Star,
  Camera,
  Coffee,
  Utensils,
  ShoppingBag,
  Bed,
  Bot,
  Save,
  Navigation,
  Info,
} from "lucide-react";

const MapArea = ({ currentCity, selectedDays, selectedRoute, onSaveRoute }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [routeName, setRouteName] = useState("");

  // 模拟景点数据
  const attractions = [
    {
      id: 1,
      name: "Eiffel Tower",
      type: "landmark",
      icon: "🗼",
      position: { top: "45%", left: "30%" },
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
      position: { top: "35%", left: "45%" },
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
      position: { top: "38%", left: "48%" },
      rating: 4.7,
      visitTime: "1-2 hours",
      description: "Medieval Catholic cathedral with Gothic architecture",
      category: "Historical",
    },
    {
      id: 4,
      name: "Café de Flore",
      type: "restaurant",
      icon: "☕",
      position: { top: "50%", left: "40%" },
      rating: 4.5,
      visitTime: "1 hour",
      description: "Historic café in Saint-Germain-des-Prés",
      category: "Dining",
    },
    {
      id: 5,
      name: "Champs-Élysées",
      type: "shopping",
      icon: "🛍️",
      position: { top: "30%", left: "35%" },
      rating: 4.6,
      visitTime: "2-3 hours",
      description: "Famous avenue for shopping and entertainment",
      category: "Shopping",
    },
    {
      id: 6,
      name: "Montmartre",
      type: "district",
      icon: "🎨",
      position: { top: "20%", left: "42%" },
      rating: 4.8,
      visitTime: "3-4 hours",
      description: "Artistic district with charming streets and cafés",
      category: "Art & Culture",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      Historical: <MapPin size={16} className="text-amber-600" />,
      "Art & Culture": <Camera size={16} className="text-purple-600" />,
      Dining: <Utensils size={16} className="text-red-600" />,
      Shopping: <ShoppingBag size={16} className="text-green-600" />,
    };
    return icons[category] || <MapPin size={16} />;
  };

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

  return (
    <div className="flex-1 relative bg-gray-100">
      {mapLoaded ? (
        <>
          {/* 主地图区域 */}
          <div className="w-full h-full relative overflow-hidden">
            {/* 地图背景 - 模拟巴黎地图 */}
            <div className="w-full h-full bg-gradient-to-br from-blue-200 via-green-100 to-yellow-100 relative">
              {/* 塞纳河 */}
              <div className="absolute top-1/3 left-1/4 w-96 h-2 bg-blue-400 rounded-full transform rotate-12 opacity-60"></div>
              <div className="absolute top-2/5 left-1/3 w-80 h-2 bg-blue-400 rounded-full transform -rotate-6 opacity-60"></div>

              {/* 街道网格 */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full h-px bg-gray-400"
                    style={{ top: `${i * 8.33}%` }}
                  />
                ))}
                {[...Array(16)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-gray-400"
                    style={{ left: `${i * 6.25}%` }}
                  />
                ))}
              </div>

              {/* 景点标记 */}
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={attraction.position}
                  onClick={() => setSelectedAttraction(attraction)}
                >
                  <div className="relative">
                    {/* 景点图标 */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-all duration-200 group-hover:scale-110 ${
                        selectedAttraction?.id === attraction.id
                          ? "bg-blue-500 ring-4 ring-blue-200"
                          : "bg-white border-2 border-gray-300 group-hover:border-blue-400"
                      }`}
                    >
                      {attraction.icon}
                    </div>

                    {/* 悬停提示 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {attraction.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 路线连线（如果选择了路线） */}
              {selectedRoute && (
                <svg className="absolute inset-0 pointer-events-none">
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                    </marker>
                  </defs>
                  {attractions.slice(0, -1).map((attraction, index) => {
                    const nextAttraction = attractions[index + 1];
                    const startX =
                      (parseFloat(attraction.position.left) / 100) *
                      window.innerWidth;
                    const startY =
                      (parseFloat(attraction.position.top) / 100) *
                      window.innerHeight;
                    const endX =
                      (parseFloat(nextAttraction.position.left) / 100) *
                      window.innerWidth;
                    const endY =
                      (parseFloat(nextAttraction.position.top) / 100) *
                      window.innerHeight;

                    return (
                      <line
                        key={`route-${index}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrowhead)"
                        opacity="0.7"
                      />
                    );
                  })}
                </svg>
              )}
            </div>

            {/* 地图控制按钮 */}
            <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
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
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
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
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-md">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <MapPin className="mr-2 text-blue-600" size={20} />
                Route Planner
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected attractions:</span>
                  <span className="font-medium">
                    {attractions.length} places
                  </span>
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
          </div>

          {/* AI旅行助手 */}
          {showAIAssistant && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm">
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

          {/* 图例 */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Historical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Art & Culture</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Dining</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Shopping</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <MapPin
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500"
                size={24}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Loading {currentCity} Map
            </h3>
            <p className="text-gray-500">Preparing your travel experience...</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapArea;
