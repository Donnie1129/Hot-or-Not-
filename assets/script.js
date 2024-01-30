const apiKey = "7c504c0ebf5b7576339364b166d18539";
const geocodingApiKey = "7c504c0ebf5b7576339364b166d18539";

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('city-search-form');
    const cityInput = document.getElementById("cityInput");
    const searchHistory = document.getElementById("search-history");
    const clearHistoryButton = document.getElementById('clear-history-button');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearSearchHistory);
    }
    // Display search history on page load
    displaySearchHistory();

    // Event listener for form submission
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const city = cityInput.value.trim();
            if (city) {
                getWeatherData(city).then(() => saveToSearchHistory(city));
            }
        });
    }

    // Fetch weather data from the API
    async function getWeatherData(city, state, country) {
        try {
            const locationUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},${state},${country}&limit=1&appid=${geocodingApiKey}`;
            const locationResponse = await fetch(locationUrl);

            if (locationResponse.ok) {
                const locationData = await locationResponse.json();
                if (locationData.length > 0) {
                    const { lat, lon } = locationData[0];
                    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
                    const weatherResponse = await fetch(weatherUrl);

                    if (weatherResponse.ok) {
                        const weatherData = await weatherResponse.json();
                        const dailyForecasts = parseWeatherData(weatherData);
                        displayForecast(dailyForecasts);
                    } else {
                        handleApiError('Error in retrieving weather data:', weatherResponse.status);
                    }
                } else {
                    handleApiError('No data found for the location.');
                }
            } else {
                handleApiError('Error in retrieving location data:', locationResponse.status);
            }
        } catch (error) {
            handleApiError('Error while fetching data:', error);
        }
    }

    // Parse the weather data and extract daily forecasts
    function parseWeatherData(data) {
        const groupedForecasts = {};

        data.list.forEach(forecast => {
            const date = forecast.dt_txt.split(' ')[0];
            if (!groupedForecasts[date]) {
                groupedForecasts[date] = [];
            }
            groupedForecasts[date].push(forecast);
        });

        const dailyForecasts = Object.values(groupedForecasts).map(forecastsForDay => {
            const firstForecast = forecastsForDay[0];
            return {
                date: firstForecast.dt_txt,
                temperature: firstForecast.main.temp,
                humidity: firstForecast.main.humidity,
                windSpeed: firstForecast.wind.speed,
                // Add more properties as needed
            };
        });

        return dailyForecasts;
    }

    // Display the forecast on the page
    function displayForecast(dailyForecasts) {
        const forecastBoxes = document.querySelectorAll('.forecast-box');
        if (forecastBoxes.length === 0) {
            console.error('No forecast boxes found.');
            return;
        }

        dailyForecasts.forEach((forecast, index) => {
            const forecastBox = forecastBoxes[index];
            if (forecastBox) {
                forecastBox.querySelector('.dt_txt').textContent = forecast.date;
                forecastBox.querySelector('.temp').textContent = `Current: ${forecast.temperature}°F`;
                forecastBox.querySelector('.humidity').textContent = `Humidity: ${forecast.humidity}%`;
                forecastBox.querySelector('.speed').textContent = `Wind Speed: ${forecast.windSpeed} m/s`;
            }
        });
    }

    // Display search history on the page
    function displaySearchHistory() {
        const searchHistoryList = JSON.parse(localStorage.getItem("searchHistory")) || [];
        searchHistory.innerHTML = ""; // Clear existing content

        searchHistoryList.forEach(city => {
            const button = createHistoryButton(city);
            searchHistory.appendChild(button);
        });
    }

    // Save searched city to local storage
    function saveToSearchHistory(city) {
        let searchHistoryList = JSON.parse(localStorage.getItem("searchHistory")) || [];

        // Check if the city is already in the search history
        if (!searchHistoryList.includes(city)) {
            // Add the city to the search history
            searchHistoryList.push(city);

            // Save the updated search history to local storage
            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryList));

            // Display the updated search history on the page
            const button = createHistoryButton(city);
            searchHistory.appendChild(button);
        }
    }

        // Function to clear search history
        function clearSearchHistory() {
            // Clear search history from local storage
            localStorage.removeItem("searchHistory");
    
            // Clear displayed search history on the page
            displaySearchHistory();
        }
        
    // Create a history button with click event listener
    function createHistoryButton(city) {
        const button = document.createElement("button");
        button.textContent = city;
        button.addEventListener('click', function () {
            getWeatherData(city);
        });
        return button;
    }

    // Handle API errors and log/display appropriate messages
    function handleApiError(message, status) {
        console.error(message, status);
        // Display user-friendly error message on the UI if needed
    }
});
