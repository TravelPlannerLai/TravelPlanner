// 简单的地图测试组件 - SimpleMapTest.jsx
import React, { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const SimpleMapTest = ({ currentCity = "New York City" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 城市坐标
  const cityCoordinates = {
    "New York City": { lat: 40.7128, lng: -74.006 },
    Paris: { lat: 48.8566, lng: 2.3522 },
    London: { lat: 51.5074, lng: -0.1278 },
  };

  useEffect(() => {
    // 检查 Google Maps API 是否已加载
    const checkAndInitMap = () => {
      if (window.google && window.google.maps) {
        console.log("Google Maps API loaded successfully");
        initMap();
      } else {
        console.log("Google Maps API not loaded, loading now...");
        loadGoogleMapsAPI();
      }
    };

    const loadGoogleMapsAPI = () => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("Google Maps script already exists");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps script loaded");
        initMap();
      };
      script.onerror = (error) => {
        console.error("Failed to load Google Maps script:", error);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      const center =
        cityCoordinates[currentCity] || cityCoordinates["New York City"];
      console.log("Initializing map with center:", center);

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: center,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });

        mapInstanceRef.current = map;
        console.log("Map initialized successfully");

        // 添加一个测试标记
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          title: currentCity,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="red" stroke="white" stroke-width="2"/>
                <text x="16" y="21" text-anchor="middle" fill="white" font-size="12">📍</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          },
        });

        console.log("Marker added successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    checkAndInitMap();
  }, [currentCity]);

  // API Key 检查
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center bg-yellow-50">
        <div className="text-center p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            API Key Missing
          </h3>
          <p className="text-sm text-yellow-700">
            Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />

      {/* 调试信息 */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg text-xs">
        <div>
          <strong>API Key:</strong>{" "}
          {GOOGLE_MAPS_API_KEY ? "✅ Set" : "❌ Missing"}
        </div>
        <div>
          <strong>Current City:</strong> {currentCity}
        </div>
        <div>
          <strong>Coordinates:</strong>{" "}
          {JSON.stringify(cityCoordinates[currentCity])}
        </div>
        <div>
          <strong>Google Maps:</strong>{" "}
          {window.google ? "✅ Loaded" : "❌ Loading..."}
        </div>
      </div>
    </div>
  );
};

export default SimpleMapTest;
