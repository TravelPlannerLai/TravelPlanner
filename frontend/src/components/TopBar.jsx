import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Download,
  Share2,
  Filter,
  Star,
  Users,
  MapPin,
} from "lucide-react";

const TopBar = ({
  currentCity,
  onCityChange,
  savedRoutes,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [shareCopied, setShareCopied] = useState(false);

  // 处理城市按钮点击
  const handleShareScreenshot = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      
      // Give user time to position the screen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      
      canvas.toBlob(async (blob) => {
        downloadBlob(blob, `${currentCity}-travel-screenshot.png`);
      });
      
    } catch (err) {
      console.error('Screen capture failed:', err);
      alert('Screen capture failed. Please try copying the link instead.');
    }
  };

  const handleShareStaticMap = async () => {
    try {
      
      if (!savedRoutes || savedRoutes.length === 0) {
        alert('No saved trips found to share!');
        return;
      }
      
      // Generate text content
      const textContent = generateTripTextFile(savedRoutes, currentCity);
      
      // Create blob with text content
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      
      // Try to share or download
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'temp.txt', { type: 'text/plain' })] })) {
        const file = new File([blob], `${currentCity}-trips-${new Date().toISOString().slice(0, 10)}.txt`, { 
          type: 'text/plain' 
        });
        
        try {
          await navigator.share({
            title: `My ${currentCity} Travel Plans`,
            text: 'Check out my travel itinerary!',
            files: [file]
          });
        } catch (shareErr) {
          console.log('Native share failed, downloading instead');
          downloadBlob(blob, `${currentCity}-trips-${new Date().toISOString().slice(0, 10)}.txt`);
        }
      } else {
        // Fallback: download the text file
        downloadBlob(blob, `${currentCity}-trips-${new Date().toISOString().slice(0, 10)}.txt`);
      }
      
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
      
    } catch (err) {
      console.error('Failed to share trips:', err);
      alert('Failed to create trip file. Please try another option.');
    }
  };

  // Helper function to generate formatted text content
  const generateTripTextFile = (routes, city) => {
    const header = `🌟 MY TRAVEL PLANS FOR ${city.toUpperCase()} 🌟\n`;
    const timestamp = `Generated on: ${new Date().toLocaleString()}\n`;
    const separator = '='.repeat(50) + '\n';
    
    let content = header + timestamp + separator + '\n';
    
    if (!routes || routes.length === 0) {
      content += `📋 No saved trips found for ${city}.\n\n`;
      content += `🌐 Visit: ${window.location.href} to start planning!\n`;
      return content;
    }
    
    routes.forEach((route, index) => {
      content += `📍 TRIP ${index + 1}: ${route.name || 'Unnamed Trip'}\n`;
      content += `🗓️  Start Date: ${route.startDate || 'Not specified'}\n`;
      content += `📅  Duration: ${route.days || 'Not specified'} days\n`;
      content += `🏙️  City: ${route.city || city}\n`;
      if (route.tripId) {
        content += `🆔  Trip ID: ${route.tripId}\n`;
      }
      content += '\n';
      
      if (route.places && route.places.length > 0) {
        content += `📋 DETAILED ITINERARY:\n`;
        
        // Group places by planDate
        const placesByDate = {};
        route.places.forEach(place => {
          const date = place.planDate || 'Unscheduled';
          if (!placesByDate[date]) {
            placesByDate[date] = [];
          }
          placesByDate[date].push(place);
        });
        
        // Sort dates
        const sortedDates = Object.keys(placesByDate).sort((a, b) => {
          if (a === 'Unscheduled') return 1;
          if (b === 'Unscheduled') return -1;
          return new Date(a) - new Date(b);
        });
        
        sortedDates.forEach((date, dateIndex) => {
          if (date !== 'Unscheduled') {
            content += `\n   📅 DAY ${dateIndex + 1} - ${date}\n`;
            content += `   ${'─'.repeat(30)}\n`;
          } else {
            content += `\n   📝 UNSCHEDULED PLACES\n`;
            content += `   ${'─'.repeat(30)}\n`;
          }
          
          // Sort places by visitOrder
          const sortedPlaces = placesByDate[date].sort((a, b) => {
            const orderA = a.visitOrder || 999;
            const orderB = b.visitOrder || 999;
            return orderA - orderB;
          });
          
          sortedPlaces.forEach((place, placeIndex) => {
            const visitOrder = place.visitOrder || (placeIndex + 1);
            content += `   ${visitOrder}. ${place.name}\n`;
            
            if (place.address && place.address !== "No address") {
              content += `      📍 ${place.address}\n`;
            }
            
            if (place.place_id || place.placeId) {
              content += `      🆔 Place ID: ${place.place_id || place.placeId}\n`;
            }
            
            if (place.notes) {
              content += `      📝 Notes: ${place.notes}\n`;
            }
            
            // Add some spacing between places
            content += '\n';
          });
        });
      } else {
        content += `📋 No specific places added to this trip yet.\n\n`;
      }
      
      // Add trip separator
      content += '-'.repeat(50) + '\n\n';
    });
    
    // Add footer
    content += `📱 Generated by TravelPlanner App\n`;
    content += `✈️ Happy travels! 🎒\n`;
    
    return content;
  };

  // Helper function to download blob
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

    

  // 处理城市按钮点击
  const handleCityClick = () => {
    navigate("/select_city", {
      state: {
        fromMain: true,
        currentCity: currentCity,
      },
    });
  };

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
            </div>
          </div>

          <div className="flex items-center space-x-3">

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
            <div className="relative">
              <button
                onClick={handleShareStaticMap}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Share2 size={16} />
                <span className="text-sm font-medium">Share Itinerary</span>
              </button>
              {shareCopied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded shadow z-50">
                  Itinerary saved!
                </span>
              )}
            </div>

            {/* 导出文件按钮 */}
            <div className="relative">
            <button 
              onClick={handleShareScreenshot}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Screenshot</span>
            </button>
          </div>
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
