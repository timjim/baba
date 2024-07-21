document.addEventListener('DOMContentLoaded', function() {
    fetchWeatherData();
});

function fetchWeatherData() {
    // Replace with your actual Apps Script web app URL
    const url = 'https://script.google.com/macros/s/AKfycbyVnB8Dv5ZRYymd9_XBTNcVAAZkOZd_L07NBLXgjIMb82Lf0wIxxAa5B_KuBHUFua45hw/exec';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayWeatherData(data) {
    const weatherDiv = document.getElementById('weather-data');
    weatherDiv.innerHTML = `
        <h2>Location: ${data.location.name}</h2>
        <p>Today: ${data.today.temperature}</p>
        <p>Rain: ${data.today.rain}</p>
        <p>Sunshine: ${data.today.sunshine}</p>
        <!-- Add more data as needed -->
    `;
}