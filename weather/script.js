const API_KEY = "ac62974ec65f464fabd73955252503"; // Replace with your WeatherAPI key

document.addEventListener("DOMContentLoaded", () => {
    getUserLocation();
    setupDarkMode();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// 🌍 Get User Location (Now Uses Reverse Geocoding for City Name)
function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getCityFromCoordinates(lat, lon);
                getWeather(lat, lon);
            },
            () => {
                console.warn("Geolocation denied, using IP-based location...");
                getIPLocation();
            }
        );
    } else {
        console.warn("Geolocation not supported, using IP-based location...");
        getIPLocation();
    }
}

// 📍 Convert Latitude & Longitude to City Name
function getCityFromCoordinates(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("location").textContent = data.address.city || data.address.town || "Unknown Location";
        })
        .catch(() => {
            document.getElementById("location").textContent = "City Not Found";
        });
}

// 🌎 Fallback: Get Location Using IP
function getIPLocation() {
    fetch("https://ipapi.co/json/")
        .then(response => response.json())
        .then(data => {
            if (data.city && data.latitude && data.longitude) {
                document.getElementById("location").textContent = data.city;
                getWeather(data.latitude, data.longitude);
            } else {
                document.getElementById("location").textContent = "Location Not Found";
            }
        })
        .catch(() => {
            document.getElementById("location").textContent = "Location Not Found";
        });
}

// 🌤 Fetch Weather Data
function getWeather(lat, lon) {
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=yes`)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => console.error("Error fetching weather data:", error));
}

// 🔄 Update Weather UI
function updateWeatherUI(data) {
    document.getElementById("temperature").textContent = `${data.current.temp_c}°C`;
    document.getElementById("condition").textContent = data.current.condition.text;
    document.getElementById("humidity").textContent = `${data.current.humidity}%`;
    document.getElementById("wind").textContent = `${data.current.wind_kph} km/h`;

    // Check for AQI data
    if (data.current.air_quality) {
        let aqi = data.current.air_quality["us-epa-index"] || "N/A";
        document.getElementById("aqi").textContent = `AQI: ${aqi}`;
        document.getElementById("aqi-status").textContent = getAQIMessage(aqi);
    } else {
        document.getElementById("aqi").textContent = "AQI: Data Unavailable";
        document.getElementById("aqi-status").textContent = "";
    }

    document.getElementById("condition").innerHTML = `
        <img class="weather-icon" src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
        ${data.current.condition.text}
    `;

    updateHourlyForecast(data.forecast.forecastday[0].hour);
    updateWeeklyForecast(data.forecast.forecastday);
}

// 🏭 Determine Air Quality Message
function getAQIMessage(aqi) {
    if (aqi === "N/A") return "AQI data unavailable";
    
    aqi = parseInt(aqi);
    
    if (aqi === 1) return "Excellent air quality! 🌱";
    if (aqi === 2) return "Good air quality. 🌤";
    if (aqi === 3) return "Moderate air quality. Consider precautions. 😐";
    if (aqi === 4) return "Unhealthy for sensitive groups. Wear a mask if necessary. 🤧";
    if (aqi === 5) return "Unhealthy air! Try to stay indoors. ⚠";
    if (aqi === 6) return "Hazardous air quality! Avoid outdoor activities. 🚨";

    return "Unknown air quality level.";
}

// ⏳ Hourly Forecast
function updateHourlyForecast(hours) {
    const hourlyContainer = document.getElementById("hourly-container");
    hourlyContainer.innerHTML = "";
    hours.slice(0, 24).forEach(hour => {
        const time = new Date(hour.time).getHours();
        hourlyContainer.innerHTML += `
            <div class="weather-card fade-in">
                <p>${time}:00</p>
                <img class="weather-icon" src="https:${hour.condition.icon}" alt="${hour.condition.text}">
                <p>${hour.temp_c}°C</p>
            </div>
        `;
    });
}

// 📅 Weekly Forecast
function updateWeeklyForecast(days) {
    const weeklyContainer = document.getElementById("weekly-container");
    weeklyContainer.innerHTML = "";
    days.forEach(day => {
        weeklyContainer.innerHTML += `
            <div class="weather-card fade-in">
                <p>${day.date}</p>
                <img class="weather-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <p>${day.day.avgtemp_c}°C</p>
            </div>
        `;
    });
}

// 🌙 Dark Mode Toggle
function setupDarkMode() {
    const toggleButton = document.getElementById("theme-toggle");
    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}
