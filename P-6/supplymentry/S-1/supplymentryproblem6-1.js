const STORAGE_KEY = "weatherDashboardPreferredCity";
const DEFAULT_CITY = "London";

const elements = {
  form: document.querySelector("#search-form"),
  cityInput: document.querySelector("#city-input"),
  status: document.querySelector("#status-message"),
  content: document.querySelector("#weather-content"),
  locationName: document.querySelector("#location-name"),
  locationDetail: document.querySelector("#location-detail"),
  weatherIcon: document.querySelector("#weather-icon"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition"),
  feelsLike: document.querySelector("#feels-like"),
  localDate: document.querySelector("#local-date"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#wind-speed"),
  cloudCover: document.querySelector("#cloud-cover"),
  precipitation: document.querySelector("#precipitation"),
  pressure: document.querySelector("#pressure"),
  sunTimes: document.querySelector("#sun-times"),
  forecastIcon: document.querySelector("#forecast-icon"),
  forecastDescription: document.querySelector("#forecast-description"),
  highTemperature: document.querySelector("#high-temperature"),
  lowTemperature: document.querySelector("#low-temperature"),
  forecastNote: document.querySelector("#forecast-note")
};

const weatherDescriptions = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Fog", "🌫"],
  48: ["Depositing rime fog", "🌫"],
  51: ["Light drizzle", "🌦"],
  53: ["Drizzle", "🌦"],
  55: ["Dense drizzle", "🌧"],
  56: ["Freezing drizzle", "🌧"],
  57: ["Heavy freezing drizzle", "🌧"],
  61: ["Light rain", "🌦"],
  63: ["Rain", "🌧"],
  65: ["Heavy rain", "🌧"],
  66: ["Freezing rain", "🌧"],
  67: ["Heavy freezing rain", "🌧"],
  71: ["Light snow", "🌨"],
  73: ["Snow", "🌨"],
  75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"],
  80: ["Rain showers", "🌦"],
  81: ["Showers", "🌧"],
  82: ["Heavy showers", "🌧"],
  85: ["Snow showers", "🌨"],
  86: ["Heavy snow showers", "🌨"],
  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm with hail", "⛈"],
  99: ["Thunderstorm with heavy hail", "⛈"]
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", isError);
}

function formatTime(dateTime) {
  return dateTime.slice(11, 16);
}

function getWeatherDescription(code) {
  return weatherDescriptions[code] ?? ["Weather conditions", "◌"];
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}. Please try again.`);
  }
  return response.json();
}

async function loadWeather(city) {
  const requestedCity = city.trim();
  if (!requestedCity) {
    setStatus("Enter a city name to see its weather.", true);
    return;
  }

  setStatus(`Looking up ${requestedCity}...`);
  elements.form.querySelector("button").disabled = true;

  try {
    const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodingUrl.search = new URLSearchParams({
      name: requestedCity,
      count: "1",
      language: "en",
      format: "json"
    });
    const locationData = await fetchJson(geocodingUrl);
    const location = locationData.results?.[0];
    if (!location) {
      throw new Error(`We couldn't find "${requestedCity}". Check the spelling and try again.`);
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
      timezone: "auto",
      forecast_days: "1"
    });
    const weatherData = await fetchJson(weatherUrl);
    renderWeather(location, weatherData);

    elements.cityInput.value = location.name;
    setStatus("");
    try {
      localStorage.setItem(STORAGE_KEY, location.name);
    } catch (error) {
      console.warn("Could not save the preferred city in local storage.", error);
    }
  } catch (error) {
    setStatus(error.message || "Unable to load weather right now. Please try again.", true);
  } finally {
    elements.form.querySelector("button").disabled = false;
  }
}

function renderWeather(location, data) {
  const current = data.current;
  const daily = data.daily;
  if (!current || !daily || !daily.time?.[0]) {
    throw new Error("The weather service returned incomplete weather data. Please try again.");
  }

  const [description, icon] = getWeatherDescription(current.weather_code);
  const [forecastDescription, forecastIcon] = getWeatherDescription(daily.weather_code?.[0]);
  const region = [location.admin1, location.country].filter(Boolean).join(", ");
  const localDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${daily.time[0]}T12:00:00Z`));

  elements.locationName.textContent = location.name;
  elements.locationDetail.textContent = region || `Lat ${location.latitude.toFixed(2)}, Lon ${location.longitude.toFixed(2)}`;
  elements.weatherIcon.textContent = icon;
  elements.temperature.textContent = Math.round(current.temperature_2m);
  elements.condition.textContent = description;
  elements.feelsLike.textContent = Math.round(current.apparent_temperature);
  elements.localDate.textContent = localDate;
  elements.humidity.textContent = current.relative_humidity_2m;
  elements.windSpeed.textContent = Math.round(current.wind_speed_10m);
  elements.cloudCover.textContent = current.cloud_cover;
  elements.precipitation.textContent = Number(current.precipitation).toFixed(1);
  elements.pressure.textContent = Math.round(current.pressure_msl);
  elements.sunTimes.textContent = `${formatTime(daily.sunrise[0])} / ${formatTime(daily.sunset[0])}`;
  elements.forecastIcon.textContent = forecastIcon;
  elements.forecastDescription.textContent = `Today: ${forecastDescription.toLowerCase()}`;
  elements.highTemperature.textContent = Math.round(daily.temperature_2m_max[0]);
  elements.lowTemperature.textContent = Math.round(daily.temperature_2m_min[0]);
  elements.forecastNote.textContent = `Today's high and low · ${data.daily_units.temperature_2m_max}`;
  elements.content.hidden = false;
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadWeather(elements.cityInput.value);
});

let preferredCity = DEFAULT_CITY;
try {
  preferredCity = localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY;
} catch (error) {
  console.warn("Could not read the preferred city from local storage.", error);
}
elements.cityInput.value = preferredCity;
loadWeather(preferredCity);
