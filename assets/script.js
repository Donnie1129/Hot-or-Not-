// My name is Donnie
var apiKey = "7c504c0ebf5b7576339364b166d18539";
var geocodingApiKey = "7c504c0ebf5b7576339364b166d18539";
var apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=${apiKey}`;
var geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q={city}&limit={limit}&appid=${geocodingApiKey}&units=imperial`;

var form = document.getElementById('city-search-form');
var cityInput = document.getElementById("cityInput");
var currentWeather = document.getElementById("current-weather"); 
var forecast = document.getElementById("forecast");
var searchHistory = document.getElementById("search-history");

async function getWeatherData(city, state, country) {
    try {
        const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},${state},${country}&limit=1&appid=${geocodingApiKey}`;
        
        const response = await fetch(apiUrl);
        console.log('Location Data API:', apiUrl);

        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
                console.log('Weather Data API:', weatherApiUrl);

                const weatherResponse = await fetch(weatherApiUrl);
                if (weatherResponse.ok) {
                    const weatherData = await weatherResponse.json();
                    console.log('Weather Data:', weatherData);
                    const dailyForecasts = parseWeatherData(weatherData);
                    displayForecast(dailyForecasts);
                } else {
                    console.error('Error in retrieving weather data:', weatherResponse.status);
                    // Handle weather data retrieval error
                }
            } else {
                console.error('No data found for the location.');
                // Handle no data found scenario
            }
        } else {
            console.error('Error in retrieving location data:', response.status);
            // Handle error in location data retrieval
        }
    } catch (error) {
        console.error('Error while fetching data:', error);
        // Handle other errors
    }
}

function parseWeatherData(data) {
    const forecasts = data.list.slice(0, 5); // Assuming the data is structured to provide forecast for 5 days
    return forecasts.map(forecast => ({
        date: forecast.dt_txt, // Date of the forecast
        temperature: forecast.main.temp, // Temperature for the day
        humidity: forecast.main.humidity, // Humidity for the day
        windSpeed: forecast.wind.speed // Wind speed for the day
        // Add more properties as needed
    }));
}

function displayForecast(dailyForecasts) {
    const forecastBoxes = document.querySelectorAll('.forecast-box');
    dailyForecasts.forEach((forecast, index) => {
        const forecastBox = forecastBoxes[index];
        // Populate each forecast box with the data
        forecastBox.querySelector('.dt_txt').textContent = forecast.date;
        forecastBox.querySelector('.forecast-temperature').textContent = `Temperature: ${forecast.temperature}°C`;
        forecastBox.querySelector('.forecast-humidity').textContent = `Humidity: ${forecast.humidity}%`;
        forecastBox.querySelector('.forecast-wind-speed').textContent = `Wind Speed: ${forecast.windSpeed} m/s`;
        // Update other elements as needed
    });
}

// Handle the form submission to get the weather data
if(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    });
}

function displaySearchHistory() {
    var searchHistoryList = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistoryList.forEach(city => {
        var button = document.createElement("button");
        button.textContent = city;
        searchHistory.appendChild(button);
    });
}

// searchHistory.addEventListener("click", (e) => {
//     if (e.target.matches("button")) {
//         var city = e.target.textContent;
//         getWeatherData(city);
//     }
// });

displaySearchHistory();
