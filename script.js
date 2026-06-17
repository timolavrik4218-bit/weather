const API_KEY = "24947e1893d6b221e25f8dcdaa238f4e";
let currentUnit = 'metric';
let currentCity = 'Kyiv';

// Отримання елементів DOM
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const highTemp = document.getElementById('highTemp');
const lowTemp = document.getElementById('lowTemp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const unitToggle = document.getElementById('unitToggle');
const dropdown = document.getElementById('dropdown');
const weatherCard = document.getElementById('weatherCard');

// Функція отримання погоди
async function getWeather(city) {
    try {
        const units = currentUnit === 'metric' ? 'metric' : 'imperial';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}&lang=ua`
        );
        
        if (!response.ok) {
            throw new Error('Місто не знайдено');
        }
        
        const data = await response.json();
        updateUI(data);
        currentCity = city;
        
        await getForecast(city);
        
    } catch (error) {
        console.error('Помилка:', error);
        weatherCard.innerHTML = `
            <div style="text-align:center;padding:2rem;color:rgba(0,255,255,0.5);font-family:'Share Tech Mono',monospace;">
                <p style="font-size:3rem;">⚠️</p>
                <p style="letter-spacing:0.2em;">ПОМИЛКА</p>
                <p style="font-size:0.7rem;margin-top:0.5rem;color:rgba(0,255,255,0.3);">${error.message}</p>
            </div>
        `;
    }
}

// Функція отримання прогнозу на 5 днів
async function getForecast(city) {
    try {
        const units = currentUnit === 'metric' ? 'metric' : 'imperial';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}&lang=ua&cnt=5`
        );
        
        if (!response.ok) {
            throw new Error('Не вдалося отримати прогноз');
        }
        
        const data = await response.json();
        updateForecast(data);
        
    } catch (error) {
        console.error('Помилка прогнозу:', error);
    }
}

// Оновлення UI з даними погоди
function updateUI(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`.toUpperCase();
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    condition.textContent = data.weather[0].description.toUpperCase();
    highTemp.textContent = `${Math.round(data.main.temp_max)}°`;
    lowTemp.textContent = `${Math.round(data.main.temp_min)}°`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed)} м/с`;
    
    const visibilityKm = data.visibility / 1000;
    visibility.textContent = `${visibilityKm.toFixed(1)} км`;
}

// Оновлення прогнозу на тиждень
function updateForecast(data) {
    const weeklyContainer = document.getElementById('weeklyForecast');
    const days = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    const dailyData = [];
    const seenDates = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toDateString();
        if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            dailyData.push({
                day: days[date.getDay()],
                temp: Math.round(item.main.temp),
                temp_min: Math.round(item.main.temp_min),
                temp_max: Math.round(item.main.temp_max),
                icon: getWeatherIcon(item.weather[0].id)
            });
        }
    });

    const displayData = dailyData.slice(0, 5);
    
    let html = '';
    displayData.forEach((day, index) => {
        if (index === 0 && day.day === days[new Date().getDay()]) {
            html += `
                <div class="weekRow">
                    <span class="weekDay">СЬОГОДНІ</span>
                    <span class="weekIcon">${day.icon}</span>
                    <span class="weekTemps">
                        <span class="weekHigh">${day.temp_max}°</span>
                        <span class="weekLow">${day.temp_min}°</span>
                    </span>
                </div>
            `;
        } else {
            html += `
                <div class="weekRow">
                    <span class="weekDay">${day.day}</span>
                    <span class="weekIcon">${day.icon}</span>
                    <span class="weekTemps">
                        <span class="weekHigh">${day.temp_max}°</span>
                        <span class="weekLow">${day.temp_min}°</span>
                    </span>
                </div>
            `;
        }
    });
    
    weeklyContainer.innerHTML = html;
}

// Отримання іконки погоди
function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 400) return '🌧️';
    if (weatherId >= 500 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId === 801) return '⛅';
    if (weatherId > 801 && weatherId < 810) return '☁️';
    return '🌡️';
}

// Пошук міст (автозаповнення)
async function searchCities(query) {
    if (query.length < 2) {
        dropdown.classList.remove('active');
        return;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const cities = await response.json();
        
        if (cities.length === 0) {
            dropdown.classList.remove('active');
            return;
        }

        dropdown.innerHTML = cities.map(city => `
            <button class="dropdownItem" onclick="selectCity('${city.name}', '${city.country}')">
                ${city.name}, ${city.country}
            </button>
        `).join('');
        dropdown.classList.add('active');
        
    } catch (error) {
        console.error('Помилка пошуку:', error);
    }
}

// Вибір міста зі списку
function selectCity(name, country) {
    cityInput.value = `${name}, ${country}`;
    dropdown.classList.remove('active');
    getWeather(name);
}

// Зміна одиниць виміру
function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';
    getWeather(currentCity);
}

// Події
cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchCities(query);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            dropdown.classList.remove('active');
            getWeather(city);
        }
    }
});

unitToggle.addEventListener('click', toggleUnit);

// Закриття випадаючого списку при кліку поза ним
document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchWrap')) {
        dropdown.classList.remove('active');
    }
});

// Завантаження погоди для Києва за замовчуванням
getWeather('Kyiv');