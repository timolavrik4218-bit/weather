const API_KEY = "24947e1893d6b221e25f8dcdaa238f4e";

// Коли сторінка завантажилась - показуємо Київ
window.onload = function() {
    getWeather('Kyiv');
}

function getWeather() {
    // Отримуємо назву міста з input
    const cityInput = document.getElementById('cityInput');
    let city = cityInput.value.trim();
    
    // Якщо нічого не ввели - показуємо Київ
    if (city === '') {
        city = 'Kyiv';
    }
    
    // Робимо запит до API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ua`;
    
    // Показуємо що завантажуємо
    document.getElementById('weatherCard').innerHTML = '<p>⏳ Завантаження...</p>';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Місто не знайдено 😢');
            }
            return response.json();
        })
        .then(data => {
            // Оновлюємо дані на сторінці
            document.getElementById('cityName').textContent = data.name;
            document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
            document.getElementById('description').textContent = data.weather[0].description;
            document.getElementById('humidity').textContent = data.main.humidity + '%';
            document.getElementById('wind').textContent = Math.round(data.wind.speed) + ' м/с';
        })
        .catch(error => {
            // Якщо помилка - показуємо
            document.getElementById('weatherCard').innerHTML = `
                <div class="error">
                    <p>😢 ${error.message}</p>
                    <p style="font-size:14px;margin-top:10px;">Спробуйте інше місто</p>
                </div>
            `;
        });
}

// Натиснули Enter - шукаємо
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});
