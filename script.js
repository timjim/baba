document.addEventListener('DOMContentLoaded', function() {
  fetchWeatherData();
});

function fetchWeatherData() {
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
  const details = [
    { value: data.today.rain, getColor: getRainColor },
    { value: data.today.sunshine, getColor: getSunshineColor },
    { value: data.today.temperature, getColor: getTemperatureColor }
  ];

  details.forEach((detail, index) => {
    const detailElement = weatherDiv.children[index];
    const circle = detailElement.querySelector('.circle');
    const placeholder = detailElement.querySelector('.text-placeholder');

    // Create a new element for the actual content
    const textContent = document.createElement('span');
    textContent.className = 'text-content';
    textContent.textContent = detail.value;

    // Update circle color
    circle.style.backgroundColor = detail.getColor(detail.value);

    // Hide placeholder and append actual content
    placeholder.style.visibility = 'hidden';
    placeholder.style.display = 'none';
    detailElement.appendChild(textContent);

    // Trigger fade-in animation with a delay based on index
    setTimeout(() => {
      detailElement.classList.add('fade-in');
    }, index * 150); // 150ms delay between each item

    // Remove placeholder class to stop the loading animation
    detailElement.classList.remove('placeholder');
  });
}

function getRainColor(rainLevel) {
  switch(rainLevel.toLowerCase()) {
    case 'no rain': return '#A2C1DD';  
    case 'light rain': return '#A2C1DD'; 
    case 'rain': return '#0461F9'; 
    case 'heavy rain': return '#0461F9';
    case 'extreme rain': return '#FF6347';
    default: return '#A2C1DD';
  }
}

function getSunshineColor(sunshinePercentage) {
  const percentage = parseInt(sunshinePercentage);
  if (isNaN(percentage)) return '#F2C94C';
  const startColor = {r: 197, g: 195, b: 192};
  const endColor = {r: 242, g: 201, b: 76};
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (percentage / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (percentage / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (percentage / 100));
  return `rgb(${r}, ${g}, ${b})`;
}

function getTemperatureColor(tempString) {
  const highTemp = parseInt(tempString.split('/')[0]);
  if (isNaN(highTemp)) return '#F2C94C';
  const coldColor = {r: 162, g: 193, b: 221};  // #A2C1DD
  const warmColor = {r: 242, g: 201, b: 76};   // #F2C94C
  const hotColor = {r: 255, g: 99, b: 71};     // #FF6347
  let startColor, endColor, percentage;
  if (highTemp < 10) {
    return `rgb(${coldColor.r}, ${coldColor.g}, ${coldColor.b})`;
  } else if (highTemp < 20) {
    startColor = coldColor;
    endColor = warmColor;
    percentage = (highTemp - 10) / 10;
  } else if (highTemp < 30) {
    startColor = warmColor;
    endColor = hotColor;
    percentage = (highTemp - 20) / 10;
  } else {
    return `rgb(${hotColor.r}, ${hotColor.g}, ${hotColor.b})`;
  }
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percentage);
  return `rgb(${r}, ${g}, ${b})`;
}