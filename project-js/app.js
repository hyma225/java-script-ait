

const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";
const DEFAULT_CITY = "Muktinath";

const ICONS = {
  "partly-cloudy-day": "https://i.ibb.co/PZQXH8V/27.png",
  "partly-cloudy-night": "https://i.ibb.co/Kzkk59k/15.png",
  rain: "https://i.ibb.co/kBd2NTS/39.png",
  "clear-day": "https://i.ibb.co/rb4rrJL/26.png",
  "clear-night": "https://i.ibb.co/1nxNGHL/10.png",
  default: "https://i.ibb.co/rb4rrJL/26.png",
};

const BACKGROUNDS = {
  "partly-cloudy-day": "https://i.ibb.co/qNv7NxZ/pc.webp",
  "partly-cloudy-night": "https://i.ibb.co/RDfPqXz/pcn.jpg",
  rain: "https://i.ibb.co/h2p6Yhd/rain.webp",
  "clear-day": "https://i.ibb.co/WGry01m/cd.jpg",
  "clear-night": "https://i.ibb.co/kqtZ1Gx/cn.jpg",
  default: "https://i.ibb.co/qNv7NxZ/pc.webp",
};

const $ = (sel) => document.querySelector(sel);

const queryInput = $("#query");
const searchBtn = $("#search");
const iconEl = $("#icon");
const tempEl = $("#temp");
const tempUnitEl = $(".temp-unit");
const dateTimeEl = $("#date-time");
const conditionEl = $("#condition");
const rainEl = $("#rain");
const locationEl = $("#location");
const cardsEl = $("#weather-cards");

const todayBtn = $("#today-btn");
const weekBtn = $("#week-btn");
const celsiusBtn = $("#celsius-btn");
const fahrenheitBtn = $("#fahrenheit-btn");

const uvIndexEl = $(".uv-index");
const uvTextEl = $(".uv-text");
const windSpeedEl = $(".wind-speed");
const sunRiseEl = $(".sun-rise");
const sunSetEl = $(".sun-set");
const humidityEl = $(".humidity");
const humidityStatusEl = $(".humidity-status");
const visibilityEl = $(".visibilty");
const visibilityStatusEl = $(".visibilty-status");
const airQualityEl = $(".air-quality");
const airQualityStatusEl = $(".air-quality-status");

let weatherData = null; // last API response
let unit = "c"; // "c" | "f"
let view = "week"; // "today" | "week"

const getIcon = (name) => ICONS[name] || ICONS.default;
const getBackground = (name) => BACKGROUNDS[name] || BACKGROUNDS.default;

function convertTemp(c) {
  const value = unit === "c" ? c : (c * 9) / 5 + 32;
  return Number(value.toFixed(1));
}
const unitLabel = () => (unit === "c" ? "°C" : "°F");

function getDateTime() {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${day}, ${hh}:${mm}`;
}


function getDayName(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}


function getHour(timeStr) {
  const h = parseInt(timeStr.split(":")[0], 10);
  if (h > 12) return `${h - 12}:00 PM`;
  return `${String(h).padStart(2, "0")}:00 AM`;
}

function to12Hour(timeStr) {
  let [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}


function uvText(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function humidityText(h) {
  if (h <= 30) return "Low";
  if (h <= 60) return "Moderate";
  return "High";
}

function visibilityText(v) {
  if (v <= 0.3) return "Dense Fog";
  if (v <= 1) return "Fog";
  if (v <= 2) return "Thick Haze";
  if (v <= 4) return "Haze";
  if (v <= 10) return "Light Haze";
  return "Very Clear Air";
}

function airQualityText(aq) {
  if (aq <= 50) return "Good 👌";
  if (aq <= 100) return "Moderate 😐";
  if (aq <= 150) return "Unhealthy for Sensitive Groups 😷";
  if (aq <= 200) return "Unhealthy 😷";
  if (aq <= 250) return "Very Unhealthy 😨";
  return "Hazardous 😱";
}


function renderCurrent() {
  if (!weatherData) return;
  const cc = weatherData.currentConditions;

  tempEl.textContent = convertTemp(cc.temp);
  tempUnitEl.textContent = unitLabel();
  iconEl.src = getIcon(cc.icon);
  conditionEl.textContent = cc.conditions;
  rainEl.textContent = cc.precip || 0;
  locationEl.textContent = weatherData.resolvedAddress;
  document.body.style.backgroundImage = `url("${getBackground(cc.icon)}")`;
}

function renderHighlights() {
  if (!weatherData) return;
  const cc = weatherData.currentConditions;

  uvIndexEl.textContent = cc.uvindex;
  uvTextEl.textContent = uvText(cc.uvindex);

  windSpeedEl.textContent = cc.windspeed;

  sunRiseEl.textContent = to12Hour(cc.sunrise);
  sunSetEl.textContent = to12Hour(cc.sunset);

  humidityEl.textContent = `${cc.humidity.toFixed(2)}%`;
  humidityStatusEl.textContent = humidityText(cc.humidity);

  visibilityEl.textContent = cc.visibility;
  visibilityStatusEl.textContent = visibilityText(cc.visibility);

  
  const aq = cc.aqius ?? cc.aqieur;
  if (typeof aq === "number") {
    airQualityEl.textContent = aq;
    airQualityStatusEl.textContent = airQualityText(aq);
  } else {
    airQualityEl.textContent = "N/A";
    airQualityStatusEl.textContent = "Not available";
  }
}

function makeCard(label, iconName, tempC) {
  return `
    <div class="card">
      <h2 class="day-name">${label}</h2>
      <img class="card-icon" src="${getIcon(iconName)}" alt="${iconName}" />
      <div class="day-temp">${convertTemp(tempC)}<span class="temp-sup">${unitLabel()}</span></div>
    </div>`;
}

function renderCards() {
  if (!weatherData) return;

  if (view === "today") {
    const hours = weatherData.days[0].hours;
    cardsEl.innerHTML = hours
      .map((h) => makeCard(getHour(h.datetime), h.icon, h.temp))
      .join("");
  } else {
    const days = weatherData.days.slice(0, 7);
    cardsEl.innerHTML = days
      .map((d) => makeCard(getDayName(d.datetime), d.icon, d.temp))
      .join("");
  }
}

function renderAll() {
  renderCurrent();
  renderHighlights();
  renderCards();
}


async function getWeatherData(city) {
  const url =
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
    `${encodeURIComponent(city)}?unitGroup=metric&key=${API_KEY}&contentType=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    weatherData = await res.json();
    renderAll();
  } catch (err) {
    console.error(err);
    alert("City not found or the weather service is unavailable. Please try another city.");
  }
}

function search() {
  const city = queryInput.value.trim();
  if (city) getWeatherData(city);
}

searchBtn.addEventListener("click", search);
queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

function setUnit(next) {
  unit = next;
  celsiusBtn.classList.toggle("active", unit === "c");
  fahrenheitBtn.classList.toggle("active", unit === "f");
  tempUnitEl.textContent = unitLabel();
  renderCurrent();
  renderCards();
}
celsiusBtn.addEventListener("click", () => setUnit("c"));
fahrenheitBtn.addEventListener("click", () => setUnit("f"));

function setView(next) {
  view = next;
  todayBtn.classList.toggle("active", view === "today");
  weekBtn.classList.toggle("active", view === "week");
  renderCards();
}
todayBtn.addEventListener("click", () => setView("today"));
weekBtn.addEventListener("click", () => setView("week"));

dateTimeEl.textContent = getDateTime();
setInterval(() => (dateTimeEl.textContent = getDateTime()), 30 * 1000);

getWeatherData(DEFAULT_CITY);
