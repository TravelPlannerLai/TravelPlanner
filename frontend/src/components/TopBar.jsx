import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Download,
  Share2,
  Search,
  Filter,
  Star,
  Users,
  MapPin,
} from "lucide-react";

const TopBar = ({
  currentCity,
  selectedDays,
  onCityChange,
  onDaysChange,
  selectedRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();


  // 处理城市按钮点击
  const handleCityClick = () => {
    navigate("/select_city", {
      state: {
        fromMain: true,
        currentCity: currentCity,
      },
    });
  };

  const dayOptions = [
    { value: "1day", label: "1 Day Trip" },
    { value: "2days", label: "2 Days" },
    { value: "3days", label: "3 Days" },
    { value: "5days", label: "5 Days" },
    { value: "7days", label: "1 Week" },
    { value: "14days", label: "2 Weeks" },
  ];

  const popularCities = [
    "Paris",
    "London",
    "Tokyo",
    "New York",
    "Rome",
    "Barcelona",
  ];

  const budgetRanges = [
    { label: "Budget ($)", icon: "💰", range: "$0-$100/day" },
    { label: "Mid-range ($$)", icon: "💳", range: "$100-$300/day" },
    { label: "Luxury ($$$)", icon: "💎", range: "$300+/day" },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* 主工具栏 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* 左侧：目的地和时间信息 */}
          <div className="flex items-center space-x-6">
            {/* 当前城市 - 修改为可点击按钮 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCityClick}
                className="group flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <MapPin
                  size={18}
                  className="text-blue-600 group-hover:text-blue-700"
                />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center group-hover:text-blue-700 transition-colors">
                    {currentCity}
                    <Star
                      className="ml-2 text-yellow-500"
                      size={20}
                      fill="currentColor"
                    />
                  </h2>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                    Click to change city
                  </p>
                </div>
              </button>

              {/* 显示当前日期 */}
              <div className="text-left border-l border-gray-200 pl-4">
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* 行程天数选择 */}
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-500" />
              <select
                value={selectedDays}
                onChange={(e) => onDaysChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 右侧：搜索和操作按钮 */}
          <div className="flex items-center space-x-3">
          {/*  /!* 搜索框 *!/*/}
          {/*  <div className="relative">*/}
          {/*    <Autocomplete*/}
          {/*      onLoad={(ac) => (autoCompleteRef.current = ac)}*/}
          {/*      onPlaceChanged={handlePlaceChanged}*/}
          {/*      options={{*/}
          {/*        bounds: new window.google.maps.LatLngBounds(*/}
          {/*            { lat: 39.5, lng: 115.5 }, // southwest corner*/}
          {/*            { lat: 41.5, lng: 117.5 }  // northeast corner*/}
          {/*        ),*/}
          {/*        strictBounds: true,*/}
          {/*        componentRestrictions: { country: "cn" }, // 限制中国*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <input*/}
          {/*        type="text"*/}
          {/*        placeholder="Search destinations..."*/}
          {/*        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"*/}
          {/*      />*/}
          {/*    </Autocomplete>*/}
          {/*  </div>*/}

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* 分享按钮 */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors">
              <Share2 size={16} />
              <span className="text-sm font-medium">Share</span>
            </button>

            {/* 导出PDF按钮 */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
              <Download size={16} />
              <span>Export Itinerary</span>
            </button>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-6">
            {/* 热门城市 */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Popular Destinations
              </h4>
              <div className="space-y-2">
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      currentCity === city
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 预算范围 */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Budget Range</h4>
              <div className="space-y-2">
                {budgetRanges.map((budget, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{budget.icon}</span>
                      <div>
                        <p className="font-medium">{budget.label}</p>
                        <p className="text-xs text-gray-500">{budget.range}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 旅行类型 */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Travel Style</h4>
              <div className="space-y-2">
                {[
                  { icon: "🏛️", label: "Cultural & Historical" },
                  { icon: "🍽️", label: "Food & Dining" },
                  { icon: "🎨", label: "Art & Museums" },
                  { icon: "🌃", label: "Nightlife" },
                  { icon: "🛍️", label: "Shopping" },
                ].map((style, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {style.icon} {style.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 团体大小 */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Group Size</h4>
              <div className="space-y-2">
                {[
                  {
                    icon: <Users size={16} />,
                    label: "Solo Travel",
                    count: "1 person",
                  },
                  {
                    icon: <Users size={16} />,
                    label: "Couple",
                    count: "2 people",
                  },
                  {
                    icon: <Users size={16} />,
                    label: "Family",
                    count: "3-5 people",
                  },
                  {
                    icon: <Users size={16} />,
                    label: "Group",
                    count: "6+ people",
                  },
                ].map((group, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {group.icon}
                      <div>
                        <p className="font-medium">{group.label}</p>
                        <p className="text-xs text-gray-500">{group.count}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
