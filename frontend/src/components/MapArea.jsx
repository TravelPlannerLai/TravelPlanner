import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import aiService from './AIService';
import {
  MapPin,
  Bot,
  Save,
} from "lucide-react";
import Cookies from "js-cookie";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 使用你的 Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const delta = 0.5;


export async function fetchCityCoordinates(cityName, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    cityName
  )}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    // You can also extract country if needed
    const countryComponent = data.results[0].address_components.find((c) =>
      c.types.includes("country")
    );
    const country = countryComponent ? countryComponent.long_name : "Unknown";
    return { lat, lng, country };
  } else {
    throw new Error("City not found");
  }
}

// SortableItem component for each waypoint
function SortableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px 12px",
    background: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "8px",
    border: "1px solid #e5e7eb",
    cursor: "grab",
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {name}
    </li>
  );
}

// Google Maps 组件
const GoogleMapComponent = React.forwardRef((props, ref) => {
  const {
    currentCity,
    attractions,
    onAttractionClick,
    places,
    addPlace,
    deletePlace,
    updatePlaceName,
    addPOIToBackend,
    cityCoordinates,
  } = props;

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  useImperativeHandle(ref, () => ({
      getMapInstance: () => mapInstanceRef.current,
    }));

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

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      mapInstanceRef.current = map;

      // 清除旧标记
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

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
                    // Show detailed info in confirm
                    const confirmMsg = `
              Add this place to your route?

              Name: ${newPlace.name}
              Address: ${newPlace.address}
              Types: ${
                Array.isArray(newPlace.types) ? newPlace.types.join(", ") : ""
              }
              Rating: ${newPlace.rating ?? "N/A"}
              Open Now: ${
                newPlace.opening_hours
                  ? newPlace.opening_hours.open_now
                    ? "Yes"
                    : "No"
                  : "N/A"
              }
                          `.trim();

                    // Add confirmation before adding
                    if (window.confirm(confirmMsg)) {
                      addPlace(newPlace);
                      addPOIToBackend(currentCity, newPlace);
                    }
                  }
                }
              );
            } else {
              alert("Customized pin cannot be added to Route");
            }
          }
        );
      });

    };

    

    // Before appending the script
    if (!window.google || !window.google.maps) {
      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        // If script exists but google.maps is not ready, wait and retry
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
      }
    } else {
      initMap();
    }
  }, [
    currentCity,
    attractions,
    onAttractionClick,
    addPlace,
    places,
    deletePlace,
    updatePlaceName,
    addPOIToBackend,
    cityCoordinates,
    ref,
  ]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
});

// 主 MapArea 组件
const MapArea = ({
  currentCity,
  // selectedDays,
  // selectedRoute,
  onSaveRoute,
  tripDays = 0,
  // setTripDays = () => {}, // Function to set trip days, default to no-op
}) => {
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponseType, setAiResponseType] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentDay, setCurrentDay] = useState(() => {
    const cookieDay = Cookies.get("currentDay");
    return cookieDay ? cookieDay : 1;
  });

  useEffect(() => {
    Cookies.set("currentDay", currentDay, { expires: 7 });
  }, [currentDay]);

  const [placesByDay, setPlacesByDay] = useState({ 1: [] });
  const [waypoints, setWaypoints] = useState([]);
  const autoCompleteRef = useRef();
    

  const handleDayChange = (e) => {
    console.log("Changing current day to:", e.target.value);
    setCurrentDay(e.target.value);
    Cookies.set("currentDay", e.target.value, { expires: 7 });
  };

  const [cityCoordinates, setCityCoordinates] = useState({});
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    const handleShowAssistant = (event) => {
      setShowAIAssistant(true);
      // Check if detail exists and use it, otherwise default to false (expanded)
      const shouldMinimize = event.detail?.isMinimized ?? false;
      setIsMinimized(shouldMinimize);
    };

    // Listen for custom event from sidebar
    window.addEventListener('showTravelAssistant', handleShowAssistant);
    
    return () => {
      window.removeEventListener('showTravelAssistant', handleShowAssistant);
    };
  }, []);

  // Restore placesByDay and waypoints from cookie on mount
  useEffect(() => {
    const saved = Cookies.get("placesByDay");
    if (saved) {
      console.log("Restoring placesByDay from cookie:", saved);
      try {
        const parsed = JSON.parse(saved);
          // For each day, fetch place details by place_id using Google PlacesService
          const fetchAll = async () => {
            const newPlacesByDay = {};
            const mapInstance = mapRef.current && mapRef.current.getMapInstance && mapRef.current.getMapInstance();
            if (!window.google || !window.google.maps || !mapInstance) {
              // Wait for map to be ready
              setTimeout(fetchAll, 300);
              return;
            }
            const service = new window.google.maps.places.PlacesService(mapInstance);
            for (const [day, placeIds] of Object.entries(parsed.placeIdsByDay)) {
              console.log(`Fetching details for day ${day} with placeIds:`, placeIds);
              const places = await Promise.all(
                placeIds.map(
                  (place_id) =>
                    new Promise((resolve) => {
                      service.getDetails(
                        {
                          placeId: place_id,
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
                            status === window.google.maps.places.PlacesServiceStatus.OK &&
                            details
                          ) {
                            resolve({
                              name: details.name,
                              address: details.formatted_address || details.vicinity || "No address",
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
                            });
                          } else {
                            resolve(null);
                          }
                        }
                      );
                    })
                )
              );
              newPlacesByDay[day] = places.filter(Boolean);
            }
            setPlacesByDay(newPlacesByDay);
            // Restore currentDay from cookie, not from Object.keys
            const cookieDay = Cookies.get("currentDay");
            console.log("Restored cookieDay:", cookieDay);
            if (cookieDay) {
              setCurrentDay(cookieDay);
            } else {
              // fallback: first key
              const days = Object.keys(newPlacesByDay);
              setCurrentDay(days.length > 0 ? days[0] : 1);
            }
            console.log("Restored placesByDay:", newPlacesByDay);
            // Restore waypoints for current day
            const restored = newPlacesByDay[currentDay] || [];
            setWaypoints(
              restored.map((p, i) => ({
                id: p.place_id || `idx-${i}`,
                name: p.name,
                lat: p.lat,
                lng: p.lng,
                address: p.address || p.formatted_address || "",
              }))
            );
            console.log("Restored waypoints for current day:", restored);
          };
          fetchAll();
      } catch {
        setPlacesByDay({ 1: [] });
        setCurrentDay(1);
        setWaypoints([]);
        console.error("Failed to parse placesByDay from cookie, resetting state.");
      }
    } else {
      setPlacesByDay({ 1: [] });
      setCurrentDay(1);
      setWaypoints([]);
      console.log("No saved placesByDay found in cookies, starting fresh.");
    }
    // eslint-disable-next-line
  }, []);

  // Update waypoints when placesByDay or currentDay changes
  useEffect(() => {
    setWaypoints(
      (placesByDay[currentDay] || []).map((p, i) => ({
        id: p.place_id || `idx-${i}`,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        address: p.address || p.formatted_address || "",
      }))
    );
  }, [placesByDay, currentDay]);

  useEffect(() => {
    async function getCoordinates() {
      if (!cityCoordinates[currentCity]) {
        try {
          const coords = await fetchCityCoordinates(
            currentCity,
            GOOGLE_MAPS_API_KEY
          );
          setCityCoordinates((prev) => ({
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

  useEffect(() => {
    // Only save place_ids for each day
    const placeIdsByDay = {};
    Object.entries(placesByDay).forEach(([day, places]) => {
      placeIdsByDay[day] = places.map((p) => p.place_id).filter(Boolean);
    });
    Cookies.set(
      "placesByDay",
      JSON.stringify({placeIdsByDay}),
      { expires: 7 }
    );
  }, [placesByDay]);


  useEffect(() => {
    setWaypoints((placesByDay[currentDay] || []).map((p, i) => ({ id: p.place_id || `idx-${i}`, name: p.name, lat: p.lat, lng: p.lng, address: p.address || p.formatted_address || "" })));
  }, [placesByDay, currentDay]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWaypoints((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // Optionally: update placesByDay[currentDay] order here as well!
    }
  }

  const dayKeys = Array.from({ length: tripDays }, (_, i) => (i + 1).toString());
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
    const daysWithPins = [[currentDay, waypoints]].filter(
      ([day, pins]) => pins && pins.length > 0
    );
    console.log("Days with pins:", daysWithPins);
    if (daysWithPins.length === 0) {
      alert("请至少在一天放置一个景点后再保存路线！");
      return;
    }
    // 获取 cityId
    let cityId = null;
    let cityQueryName = currentCity;
    if (cityQueryName === "New York City") cityQueryName = "New York";
    try {
      // 获取 cityId
      const cityRes = await fetch(`/api/city/name?name=${encodeURIComponent(cityQueryName)}`,{ credentials: "include" });
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        cityId = cityData.cityId?.replace(/^"|"$/g, "");
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
    const tripId = Cookies.get("tripId") || null;
    let startDate = Cookies.get("startDate");
    if (!startDate || isNaN(new Date(startDate))) {
      startDate = new Date().toISOString().slice(0, 10); // fallback to today
    }
    if (!tripId) {
      alert("无法保存路线！");
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
      const pois = pins
        .filter((p) => p.id)
        .map((p, idx) => ({
          cityId,
          placeId: p.id,
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
        console.log("POIS to save:", pois);
        onSaveRoute({
          days: dayNumber,
          places: pois.map((p) => ({
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            address: p.formattedAddress || p.address || "",
            visitOrder: p.visitOrder,
            placeId: p.placeId || p.place_id,
            planDate: p.planDate || planDate,
          })),
          tripId,
          cityId,
          startDate,

        });
      } catch (e) {
        alert(`保存第${dayNumber}天路线失败`);
        return;
      }
    }
    alert("路线已成功保存到数据库！");
    // 可选：清空本地数据或刷新 saved routes
    window.location.reload();
  };

  // load 搜索库
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;


  // 处理搜索选中
  const handlePlaceChanged = () => {
    const place = autoCompleteRef.current.getPlace();

    if (!place.geometry) {
      alert("Place not found!");
      return;
    }

    // const lat = place.geometry.location.lat();
    // const lng = place.geometry.location.lng();
    // const name = place.name;

    // const selectedPlace = {
    //   name,
    //   lat,
    //   lng,
    // };
    const newPlace = {
      name: place.name,
      address:
          place.formatted_address ||
          place.vicinity ||
          "No address",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      place_id: place.place_id,
      types: place.types || [],
      price_level: place.price_level ?? null,
      rating: place.rating ?? null,
      user_ratings_total: place.user_ratings_total ?? null,
      opening_hours: place.opening_hours
          ? {
            open_now: place.opening_hours.open_now,
            weekday_text: place.opening_hours.weekday_text,
          }
          : null,
      photo_reference:
          place.photos && place.photos.length > 0
              ? place.photos[0].getUrl()
              : null,
    };

    addPlace(newPlace);

  };


  const handleGenereteRoute = () => {
    const places = waypoints;
    if (!window.google || !mapRef.current || places.length < 2) {
      alert("Please select at least two places to generate a route.");
      return;
    }
    const map = mapRef.current.getMapInstance();

    // Remove previous route if exists
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (window.arrowPolylines) {
      window.arrowPolylines.forEach((poly) => poly.setMap(null));
      window.arrowPolylines = [];
    }

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeWeight: 5,
      },
    });
    directionsRendererRef.current = directionsRenderer;

    const wp = places.slice(1, -1).map((place) => ({
      location: { lat: place.lat, lng: place.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: { lat: places[0].lat, lng: places[0].lng },
        destination: { lat: places[places.length - 1].lat, lng: places[places.length - 1].lng },
        waypoints: wp,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false, // Do not show alternative routes
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Only show the main route in the default renderer
          directionsRenderer.setDirections({
            ...result,
            routes: [result.routes[0]],
          });

          // Remove previous arrow polylines
          if (window.arrowPolylines) {
            window.arrowPolylines.forEach((poly) => poly.setMap(null));
          }
          window.arrowPolylines = [];

          // Define colors for up to 8 segments
          const segmentColors = [
            "#2563eb", // blue
            "#f59e42", // orange
            "#10b981", // green
            "#f43f5e", // red
            "#a855f7", // purple
            "#eab308", // yellow
            "#6366f1", // indigo
            "#14b8a6", // teal
          ];

          // Draw arrows for each segment between waypoints for the main route
          const route = result.routes[0];
          if (route && route.legs && route.legs.length > 0) {
            for (let i = 0; i < route.legs.length; i++) {
              const leg = route.legs[i];
              let segmentPath = [];
              leg.steps.forEach((step) => {
                if (step.path && step.path.length > 0) {
                  segmentPath = segmentPath.concat(step.path);
                }
              });
              if (segmentPath.length > 1) {
                const color = segmentColors[i % segmentColors.length];
                const arrowSymbol = {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 1.5,
                  strokeColor: "#fff",
                  fillColor: "#fff",
                  fillOpacity: 1,
                };
                const arrowPolyline = new window.google.maps.Polyline({
                  path: segmentPath,
                  icons: [
                    {
                      icon: arrowSymbol,
                      offset: "0%",
                      repeat: "60px",
                    },
                  ],
                  strokeColor: color,
                  strokeWeight: 5,
                  strokeOpacity: 0.9,
                  map: map,
                  zIndex: 2,
                });
                window.arrowPolylines.push(arrowPolyline);
              }
            }
          }
        } else {
          alert("Directions request failed: " + status);
        }
      }
    );
  };

  const handleAIPlanRoute = async () => {
    setIsAiLoading(true);
    setAiResponseType('route_planning');
    
    try {
      const result = await aiService.planRoute(currentCity, waypoints);
      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiResponse(result.error);
      }
    } catch (error) {
      setAiResponse('Sorry, there was an error processing your request.');
    }
    
    setIsAiLoading(false);
  };
  
  const handleAIFindFood = async () => {
    setIsAiLoading(true);
    setAiResponseType('restaurant_recommendations');
    
    try {
      const result = await aiService.findRestaurants(currentCity, waypoints);
      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiResponse(result.error);
      }
    } catch (error) {
      setAiResponse('Sorry, there was an error finding restaurants.');
    }
    
    setIsAiLoading(false);
  };

  const handleAIWeather = async () => {
    setIsAiLoading(true);
    setAiResponseType('weather_advice');
    
    try {
      const result = await aiService.getWeatherAdvice(currentCity);
      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiResponse(result.error);
      }
    } catch (error) {
      setAiResponse('Sorry, there was an error getting weather advice.');
    }
    
    setIsAiLoading(false);
  };

  const handleAITips = async () => {
    setIsAiLoading(true);
    setAiResponseType('travel_tips');
    
    try {
      const result = await aiService.getTravelTips(currentCity);
      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiResponse(result.error);
      }
    } catch (error) {
      setAiResponse('Sorry, there was an error getting travel tips.');
    }
    
    setIsAiLoading(false);
  };

  const handleAIQuestion = async (question) => {
    if (!question.trim()) return;
    
    setIsAiLoading(true);
    setAiResponseType('general_question');
    
    try {
      const result = await aiService.askQuestion(currentCity, question, waypoints);
      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiResponse(result.error);
      }
    } catch (error) {
      setAiResponse('Sorry, there was an error processing your question.');
    }
    
    setIsAiLoading(false);
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
          ref={mapRef}
          currentCity={currentCity}
          attractions={attractions}
          places={placesByDay[currentDay] || []}
          addPlace={addPlace}
          deletePlace={deletePlace}
          updatePlaceName={updatePlaceName}
          addPOIToBackend={addPOIToBackend}
          cityCoordinates={cityCoordinates}
        />

        {/* 调试信息 - 临时显示 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded shadow-lg text-xs z-20">
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

        {/* 搜索框 */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex justify-center bg-white p-4 rounded-lg shadow-md border border-gray-300">
          <Autocomplete
            onLoad={(ac) => (autoCompleteRef.current = ac)}
            onPlaceChanged={handlePlaceChanged}
            options={
              cityCoordinates[currentCity]
                ? {
                    bounds: new window.google.maps.LatLngBounds(
                      {
                        lat: cityCoordinates[currentCity].lat - delta,
                        lng: cityCoordinates[currentCity].lng - delta,
                      }, // southwest corner
                      {
                        lat: cityCoordinates[currentCity].lat + delta,
                        lng: cityCoordinates[currentCity].lng + delta,
                      } // northeast corner
                    ),
                    strictBounds: true,
                  }
                : {}
            }
          >
            <input
              type="text"
              placeholder="Search destinations..."
              className="px-4 py-2 border border-gray-400 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80 text-gray-700 placeholder-gray-400"
            />
          </Autocomplete>
        </div>

          {/* 可拖拽的景点列表 */}
          <div className="absolute bottom-52 left-4 bg-white rounded-lg shadow-xl p-2 max-w-xs w-56 z-10 text-[11px]">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center text-[11px]" >
              <MapPin className="mr-2 text-blue-600" size={15} />
              Drag below waypoints to reorder
            </h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={waypoints.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
            {waypoints.map((item) => (
              <SortableItem key={item.id} id={item.id} name={item.name} />
            ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
            
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
              {dayKeys.map((dayKey) => (
                <option key={dayKey} value={dayKey}>
                  {`Day ${dayKey}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected attractions:</span>
              <span className="font-medium">{attractions.length} places</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveCurrentRoute}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Save size={16} className="mr-1" />
                  Save Route
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  onClick={handleGenereteRoute}
                >
                  Generate Route
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI旅行助手 */}
        {showAIAssistant && (
          <div 
            className={`absolute bottom-4 right-20 bg-white rounded-lg shadow-xl transition-all duration-300 z-10 ${
              isMinimized 
                ? 'w-14 h-14' 
                : 'p-4 max-w-sm w-80 max-h-200 overflow-y-auto'
            }`}
          >
            {/* Minimized view */}
            {isMinimized ? (
              <button
                onClick={() => setIsMinimized(false)}
                className="w-full h-full flex items-center justify-center text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors relative"
                title="Expand Travel Assistant"
              >
                <Bot size={24} />
                {/* Notification dot */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  !
                </span>
              </button>
            ) : (
              /* Expanded view */
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Bot className="mr-2 text-purple-600" size={20} />
                    AI Travel Assistant
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Minimize"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setShowAIAssistant(false);
                        setAiResponse('');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* AI Response Display */}
                  {(aiResponse || isAiLoading) && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto shadow-inner">
                      {isAiLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          <span className="text-xs text-gray-600 font-medium">AI is thinking...</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-800">
                          {/* Response Type Badge */}
                          <div className="mb-3 flex justify-start">
                            <span className="text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border border-purple-200">
                              {aiResponseType.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {/* Formatted Response Content */}
                          <div className="space-y-2 text-left">
                            {aiResponse.split('\n').map((line, index) => {
                              const trimmedLine = line.trim();
                              
                              // Skip empty lines
                              if (!trimmedLine) {
                                return <div key={index} className="h-1"></div>;
                              }
                              
                              // Main headings (lines with all caps or ending with colon)
                              if (trimmedLine.match(/^[A-Z\s]+:$/) || trimmedLine.endsWith(':')) {
                                return (
                                  <h4 key={index} className="font-bold text-gray-900 mt-3 mb-1 text-left border-b border-gray-300 pb-1">
                                    {trimmedLine}
                                  </h4>
                                );
                              }
                              
                              // Numbered lists (1. 2. 3. etc.)
                              if (trimmedLine.match(/^\d+\./)) {
                                const number = trimmedLine.match(/^\d+/)[0];
                                const content = trimmedLine.replace(/^\d+\.\s*/, '');
                                return (
                                  <div key={index} className="flex items-start space-x-3 py-1 ml-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                      {number}
                                    </span>
                                    <span className="flex-1 text-left leading-relaxed text-gray-700">
                                      {content}
                                    </span>
                                  </div>
                                );
                              }
                              
                              // Bullet points
                              if (trimmedLine.match(/^[•·\-*]\s/)) {
                                const content = trimmedLine.replace(/^[•·\-*]\s*/, '');
                                return (
                                  <div key={index} className="flex items-start space-x-3 py-1 ml-4">
                                    <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></span>
                                    <span className="flex-1 text-left leading-relaxed text-gray-700">
                                      {content}
                                    </span>
                                  </div>
                                );
                              }

                              // Bold text (text between ** **)
                              if (trimmedLine.includes('**')) {
                                const parts = trimmedLine.split(/\*\*(.*?)\*\*/g);
                                return (
                                  <div key={index} className="text-left leading-relaxed py-0.5">
                                    {parts.map((part, partIndex) => 
                                      partIndex % 2 === 1 ? (
                                        <strong key={partIndex} className="font-semibold text-gray-900">
                                          {part}
                                        </strong>
                                      ) : (
                                        <span key={partIndex} className="text-gray-700">{part}</span>
                                      )
                                    )}
                                  </div>
                                );
                              }
                              
                              // Regular paragraphs
                              return (
                                <p key={index} className="text-left leading-relaxed text-gray-700 py-0.5">
                                  {trimmedLine}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Welcome Message */}
                  {!aiResponse && !isAiLoading && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                      <p className=" text-gray-700 mb-2">
                        🤖 Hi! I'm your AI travel assistant powered by OpenAI. I can help you:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Plan optimal routes between attractions</li>
                        <li>• Find the best local restaurants</li>
                        <li>• Give weather-based recommendations</li>
                        <li>• Share insider travel tips</li>
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleAIPlanRoute}
                      disabled={isAiLoading || waypoints.length < 2}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      🗺️ Plan Route
                    </button>
                    <button 
                      onClick={handleAIFindFood}
                      disabled={isAiLoading}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      🍽️ Find Food
                    </button>
                    <button 
                      onClick={handleAIWeather}
                      disabled={isAiLoading}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      ☀️ Weather
                    </button>
                    <button 
                      onClick={handleAITips}
                      disabled={isAiLoading}
                      className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      💡 Tips
                    </button>
                  </div>

                  {/* Chat Input */}
                  <div className="border-t pt-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Ask me anything about travel..."
                        disabled={isAiLoading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isAiLoading) {
                            const question = e.target.value;
                            e.target.value = '';
                            handleAIQuestion(question);
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          if (!isAiLoading) {
                            const input = e.target.parentElement.querySelector('input');
                            const question = input.value;
                            input.value = '';
                            handleAIQuestion(question);
                          }
                        }}
                        disabled={isAiLoading}
                        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Clear Response Button */}
                  {aiResponse && !isAiLoading && (
                    <button
                      onClick={() => setAiResponse('')}
                      className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                    >
                      Clear Response
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapArea;
