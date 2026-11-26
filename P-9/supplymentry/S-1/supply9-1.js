
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const savedMessage = document.getElementById("savedMessage");

const weatherSection = document.getElementById("weatherSection");

// Load saved city from Local Storage
const savedCity = localStorage.getItem("preferredCity");

if (savedCity) {
    cityInput.value = savedCity;
    savedMessage.textContent = "Saved city: " + savedCity;

    // Automatically load previously saved city
    getWeather(savedCity);
}

// Handle city search
weatherForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});

// Get weather information
async function getWeather(city) {
    message.textContent = "Loading weather information...";
    weatherSection.hidden = true;

    try {
        // Step 1: Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);
        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Fetch current weather and 5-day forecast
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();

        // Display weather information
        displayWeather(location, weatherData);

        // Save city after successful search
        localStorage.setItem("preferredCity", location.name);

        savedMessage.textContent =
            "Your preferred city is saved: " + location.name;

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message;
        console.error(error);
    }
}

// Convert weather code into description and icon
function getWeatherInfo(code) {
    const weatherCodes = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Depositing Rime Fog", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Moderate Drizzle", "🌦️"],
        55: ["Dense Drizzle", "🌧️"],
        61: ["Slight Rain", "🌧️"],
        63: ["Moderate Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],
        71: ["Slight Snow", "🌨️"],
        73: ["Moderate Snow", "🌨️"],
        75: ["Heavy Snow", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Moderate Showers", "🌧️"],
        82: ["Heavy Showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with Hail", "⛈️"],
        99: ["Heavy Thunderstorm with Hail", "⛈️"]
    };

    return weatherCodes[code] || ["Unknown Weather", "🌡️"];
}

// Display current weather
function displayWeather(location, data) {
    const current = data.current;

    const weatherInfo = getWeatherInfo(current.weather_code);

    document.getElementById("cityName").textContent =
        location.name + ", " + (location.country || "");

    document.getElementById("weatherDate").textContent =
        "Local Time: " + current.time.replace("T", " ");

    document.getElementById("description").textContent =
        weatherInfo[0];

    document.getElementById("weatherIcon").textContent =
        weatherInfo[1];

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m) + "°C";

    document.getElementById("feelsLike").textContent =
        current.apparent_temperature + "°C";

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";

    document.getElementById("precipitation").textContent =
        current.precipitation + " mm";

    // Display forecast
    displayForecast(data.daily);

    weatherSection.hidden = false;
}

// Display 5-day forecast
function displayForecast(daily) {
    const forecastContainer =
        document.getElementById("forecastContainer");

    forecastContainer.innerHTML = "";

    daily.time.forEach((date, index) => {
        const info = getWeatherInfo(daily.weather_code[index]);

        const card = document.createElement("div");
        card.className = "forecast-card";

        const day = document.createElement("h3");
        day.textContent = new Date(date + "T00:00:00")
            .toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
            });

        const icon = document.createElement("div");
        icon.className = "icon";
        icon.textContent = info[1];

        const description = document.createElement("p");
        description.textContent = info[0];

        const maximum = document.createElement("p");
        maximum.textContent =
            "Max: " + daily.temperature_2m_max[index] + "°C";

        const minimum = document.createElement("p");
        minimum.textContent =
            "Min: " + daily.temperature_2m_min[index] + "°C";

        card.append(day, icon, description, maximum, minimum);

        forecastContainer.appendChild(card);
    });
}
