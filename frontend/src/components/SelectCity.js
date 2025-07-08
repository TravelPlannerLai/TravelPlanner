import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectCity.css";

const stateCityData = {
  Alabama: ["Birmingham", "Montgomery", "Mobile"],
  Alaska: ["Anchorage", "Fairbanks", "Juneau"],
  Arizona: ["Phoenix", "Tucson", "Mesa"],
  Arkansas: ["Little Rock", "Fort Smith", "Fayetteville"],
  California: ["Los Angeles", "San Francisco", "San Diego"],
  Colorado: ["Denver", "Colorado Springs", "Aurora"],
  Connecticut: ["Bridgeport", "New Haven", "Stamford"],
  Delaware: ["Wilmington", "Dover", "Newark"],
  Florida: ["Miami", "Orlando", "Tampa"],
  Georgia: ["Atlanta", "Savannah", "Augusta"],
  Hawaii: ["Honolulu", "Hilo", "Kailua"],
  Idaho: ["Boise", "Meridian", "Nampa"],
  Illinois: ["Chicago", "Aurora", "Naperville"],
  Indiana: ["Indianapolis", "Fort Wayne", "Evansville"],
  Iowa: ["Des Moines", "Cedar Rapids", "Davenport"],
  Kansas: ["Wichita", "Overland Park", "Kansas City"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green"],
  Louisiana: ["New Orleans", "Baton Rouge", "Shreveport"],
  Maine: ["Portland", "Lewiston", "Bangor"],
  Maryland: ["Baltimore", "Frederick", "Rockville"],
  Massachusetts: ["Boston", "Worcester", "Springfield"],
  Michigan: ["Detroit", "Grand Rapids", "Warren"],
  Minnesota: ["Minneapolis", "Saint Paul", "Rochester"],
  Mississippi: ["Jackson", "Gulfport", "Southaven"],
  Missouri: ["Kansas City", "Saint Louis", "Springfield"],
  Montana: ["Billings", "Missoula", "Great Falls"],
  Nebraska: ["Omaha", "Lincoln", "Bellevue"],
  Nevada: ["Las Vegas", "Reno", "Henderson"],
  "New Hampshire": ["Manchester", "Nashua", "Concord"],
  "New Jersey": ["Newark", "Jersey City", "Paterson"],
  "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces"],
  "New York": ["New York City", "Buffalo", "Rochester"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati"],
  Oklahoma: ["Oklahoma City", "Tulsa", "Norman"],
  Oregon: ["Portland", "Salem", "Eugene"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown"],
  "Rhode Island": ["Providence", "Cranston", "Warwick"],
  "South Carolina": ["Charleston", "Columbia", "North Charleston"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen"],
  Tennessee: ["Nashville", "Memphis", "Knoxville"],
  Texas: ["Houston", "Austin", "Dallas"],
  Utah: ["Salt Lake City", "West Valley City", "Provo"],
  Vermont: ["Burlington", "South Burlington", "Rutland"],
  Virginia: ["Virginia Beach", "Norfolk", "Richmond"],
  Washington: ["Seattle", "Spokane", "Tacoma"],
  "West Virginia": ["Charleston", "Huntington", "Morgantown"],
  Wisconsin: ["Milwaukee", "Madison", "Green Bay"],
  Wyoming: ["Cheyenne", "Casper", "Laramie"],
  "District of Columbia": ["Washington D.C."],
};

// 计算天数的函数
function calculateDays(start, end) {
  if (!start || !end) return 0;
  const startDateObj = new Date(start);
  const endDateObj = new Date(end);
  // 计算差值（毫秒），再转为天数，+1 保证包含起止两天
  const diffTime = endDateObj - startDateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

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

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setCities(stateCityData[state] || []);
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleNavigateToMainPage = () => {
    if (selectedCity) {
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

        <div style={{ marginBottom: "10px" }}>
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

        <div style={{ marginBottom: "10px" }}>
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
