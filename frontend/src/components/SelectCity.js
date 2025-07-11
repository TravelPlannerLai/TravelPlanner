import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectCity.css";
import { calculateDays } from "../utils/dateUtils";
import Cookies from "js-cookie";
import { cityCoordinatesData, stateCityData } from "./CityData";

function SelectCity() {
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripName, setTripName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 检查是否从主页面跳转过来的
  const isFromMainPage = location.state?.fromMain;


  let currentCity = Cookies.get("currentCity") || null;
  // Reset 'placesByDay' cookie if selectedCity changes from currentCity
  React.useEffect(() => {
    console.log("Current city from cookie:", Cookies.get("currentCity"));
    console.log("Selected city:", selectedCity);
    let flag = false;
    if (selectedCity && selectedCity !== currentCity) {
      // 如果 selectedCity 变化了，清除 placesByDay cookie
      Cookies.remove("placesByDay");
      Cookies.remove("startDate");
      flag = true;
    }
    console.log("Flag for placesByDay cookie:", flag);
  }, [selectedCity, currentCity]);
  

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setCities(stateCityData[state] || []);
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleNavigateToMainPage = async() => {
    if (selectedCity) {
      const days = calculateDays(startDate, endDate);
      if (days > 10) {
        alert(
          "The trip duration cannot exceed 10 days. Please select a shorter date range."
        );
        return;
      }
      let cityId = null;
      // 调用后端API
      try {
        cityId = await addCityToBackend({
            name: selectedCity,
            country: "USA", // 假设所有城市都在美国
            lat: cityCoordinatesData[selectedCity]?.lat || 0,
            lon: cityCoordinatesData[selectedCity]?.lon || 0,
          });
        console.log("City added to backend:", cityId);
        if (!cityId || cityId === "null") {
          // 获取 cityId
          const cityRes = await fetch(`/api/city/name?name=${encodeURIComponent(selectedCity)}`,{ credentials: "include" });
          if (!cityRes.ok) {
            alert("Failed to get city info!");
            return;
          }
          const cityData = await cityRes.json();
          cityId = cityData.cityId?.replace(/^"|"$/g, "");
        }
        console.log("City ID:", cityId);
      } catch (error) {
        console.error("Error fetching city ID:", error);
        alert("Failed to get city info!");
        return;
      }
        
      if (days <= 0) {
        alert("Please select a valid date range!");
        return;
      }
      createTrip(cityId, startDate, days, tripName);

      if (isFromMainPage) {
        // 如果是从主页面来的，返回主页面并传递选择的城市
        navigate("/main", {
          state: {
            selectedCity: selectedCity,
            selectedState: selectedState,
            startDate: startDate,
            endDate: endDate,
            tripName: tripName,
          },
        });
      } else {
        // 如果是从登录流程来的，正常跳转到主页面
        navigate("/main", {
          state: {
            city: selectedCity,
            selectedCity: selectedCity,
            selectedState: selectedState,
            startDate: startDate,
            endDate: endDate,
            tripName: tripName,
          },
        });
      }
    } else {
      alert("Please select a city!");
    }
  };

  const handleBackToMain = () => {
    // 返回主页面但不更改城市
    navigate("/main");
  };

  const addCityToBackend = async (city) => {
    try {
      // 获取城市坐标信息
      const coord = cityCoordinatesData[city.name];
      const cityWithCoord = coord
        ? { ...city, lat: coord.lat, lon: coord.lon, country: coord.country }
        : city;

      const response = await fetch("/api/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cityWithCoord),
      });
      if (response.status === 409) {
        console.warn("City already exists");
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to add city");
      }
      const text = await response.text();
      console.log("City added:", text);
      if (!text) return null;
      return text.replace(/^"|"$/g, "");
    } catch (error) {
      console.error("Error adding city:", error);
      return null;
    }
  };

  const createTrip = async (cityId, startDate, days, name) => {
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityId,
          startDate,
          days,
          name,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create trip");
      }
      const text = await response.text();
      console.log("Trip created:", text);
      // 设置 cookies
      Cookies.set("tripId", text?.replace(/^"|"$/g, ""), { expires: 7 });
      Cookies.set("startDate", startDate, { expires: 7 });
      return text; // 返回创建的行程ID或其他信息
    } catch (error) {
      console.error("Create trip error:", error);
      alert("Network error, please try again.");
      return null;
    }
  }

  return (
    <div className="select-city-page">
      <div className="select-city-container">
        <h1>Select State and City</h1>

        {/* 如果是从主页面来的，显示返回按钮 */}
        {isFromMainPage && (
          <button
            onClick={handleBackToMain}
            style={{
              marginBottom: "20px",
              backgroundColor: "#6c757d",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            ← Back to Main
          </button>
        )}

        <div>
          <label htmlFor="state-select">State: </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="">Select a state</option>
            {Object.keys(stateCityData).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city-select">City: </label>
          <select
            id="city-select"
            value={selectedCity}
            onChange={handleCityChange}
            disabled={!cities.length}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <p><strong>Select your trip dates(within 10 days)</strong></p>    
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "4%",
            marginBottom: "10px",
          }}
        >
          <div
            style={{ width: "48%", display: "flex", flexDirection: "column" }}
          >
            <label
              htmlFor="start-date"
              style={{ fontWeight: "bold", marginBottom: "4px" }}
            >
              Start Date:
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div
            style={{ width: "48%", display: "flex", flexDirection: "column" }}
          >
            <label
              htmlFor="end-date"
              style={{ fontWeight: "bold", marginBottom: "4px" }}
            >
              End Date:
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="trip-name">Trip Name: </label>
          <input
            id="trip-name"
            type="text"
            placeholder="Enter your trip name"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {selectedState && selectedCity && startDate && endDate && (
          <div style={{ marginTop: "20px" }}>
            <h2>You selected:</h2>
            <p>
              State: <strong>{selectedState}</strong>
            </p>
            <p>
              City: <strong>{selectedCity}</strong>
            </p>
            <p>
              Your Trip Includes:{" "}
              {startDate && endDate && (
                <span>
                  <strong>{calculateDays(startDate, endDate)} days</strong>
                </span>
              )}
            </p>
            <button onClick={handleNavigateToMainPage}>
              {isFromMainPage ? "Update" : "Go to Map"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectCity;
