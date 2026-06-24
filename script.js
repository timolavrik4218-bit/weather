const API_KEY = "24947e1893d6b221e25f8dcdaa238f4e";

// Коли сторінка завантажилась
window.onload = function() {
    getWeather('Kyiv');
}

function getWeather() {
    // Отримуємо місто
    const cityInput = document.getElementById('cityInput');
    let city = cityInput.value.trim();
    
    if (city === '') {
        city = 'Kyiv';
    }
    
    // Показуємо завантаження
    const weatherCard = document.getElementById('weatherCard');
    weatherCard.innerHTML = '<p>⏳ Завантаження...</p>';
    
    // Запит до API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ua`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Місто не знайдено 😢');
            }
            return response.json();
        })
        .then(data => {
            // Вставляємо HTML з даними
            weatherCard.innerHTML = `
                <h2 id="cityName">${data.name}</h2>
                <div class="temp">${Math.round(data.main.temp)}°C</div>
                <div class="desc">${data.weather[0].description}</div>
                <div class="details">
                    <span>💧 ${data.main.humidity}%</span>
                    <span>💨 ${Math.round(data.wind.speed)} м/с</span>
                </div>
            `;
        })
        .catch(error => {
            weatherCard.innerHTML = `
                <div class="error">
                    <p>😢 ${error.message}</p>
                    <p style="font-size:14px;margin-top:10px;">Спробуйте інше місто</p>
                </div>
            `;
        });
}

// Натиснули Enter
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});
