// Run the code after the HTML page has completely loaded
document.addEventListener('DOMContentLoaded', function () {

    // Get HTML elements
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-button');

    const weatherInfo = document.getElementById('weatherInfo');
    const cityNameDisplay = document.getElementById('city-name');
    const temperatureDisplay = document.getElementById('temperature');
    const descriptionDisplay = document.getElementById('description');
    const errorMessage = document.getElementById('error-message');

    // API key
    const apiKey = '0a9819b31ef6582b4c8ffdc99761411c';


    // When the button is clicked
    getWeatherBtn.addEventListener('click', async function () {

        // Get city name from input
        const city = cityInput.value.trim();

        // If input is empty, stop
        if (!city) {
            return;
        }

        try {

            // Get weather data
            const weatherData = await fetchWeatherData(city);

            // Display weather data
            displayWeatherData(weatherData);

        } catch (error) {

            // Display error
            displayError(error.message);
        }
    });


    // Get weather data from API
    async function fetchWeatherData(city) {

        const apiUrl =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        // Send request to API
        const response = await fetch(apiUrl);

        console.log(typeof response); // Log the response for debugging
        console.log("RESPONSE", response); // Log the response status for debugging

        // Check if city was found
        if (!response.ok) {
            throw new Error('City not found');
        }

        // Convert response into JSON
        const data = await response.json();

        // Return weather data
        return data;
    }


    // Display weather data
    function displayWeatherData(data) {
        // console.log("DATA", data); // Log the data for debugging

        cityNameDisplay.textContent = data.name;

        temperatureDisplay.textContent =
            `Temperature: ${data.main.temp}°C`;

        descriptionDisplay.textContent =
            `Weather: ${data.weather[0].description}`;

        // Show weather information
        weatherInfo.style.display = 'block';

        // Hide error message
        errorMessage.style.display = 'none';
    }


    // Display error
    function displayError(message) {

        errorMessage.textContent = message;

        // Show error message
        errorMessage.style.display = 'block';

        // Hide weather information
        weatherInfo.style.display = 'none';
    }

});