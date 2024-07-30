let soilMoistureChart = null;

function initializeSoilMoistureChart() {
  const ctx = document.getElementById('soilMoistureChart').getContext('2d');
  
  soilMoistureChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Soil Moisture'],
      datasets: [{
        data: [0],
        backgroundColor: '#0461F9',
        barThickness: 8,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 20,
          max: 80,
          display: false,
        },
        x: {
          display: false,
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
    }
  });
}

function updateSoilMoistureChart(data) {
  if (!soilMoistureChart) {
    initializeSoilMoistureChart();
  }

  const soilMoistureScore = data.conditions.soilMoisture.score;
  soilMoistureChart.data.datasets[0].data = [soilMoistureScore];
  soilMoistureChart.update();

  updateMoistureLabels(soilMoistureScore);

  const statusElement = document.querySelector('#soil-moisture .soil-moisture-insight');
  if (statusElement) {
    updateDetailElement(statusElement, {
      value: data.conditions.header.status,
      getColor: () => '#A2C1DD'
    });
  }
}

function updateMoistureLabels(score) {
  const labels = document.querySelectorAll('.moisture-labels .label');
  labels.forEach(label => label.classList.remove('active'));

  if (score < 33) {
    labels[2].classList.add('active'); // Dry soil
  } else if (score < 66) {
    labels[1].classList.add('active'); // Optimal
  } else {
    labels[0].classList.add('active'); // Wet soil
  }
}

function fetchWeatherData() {
  const url = 'https://script.google.com/macros/s/AKfycbyDCp4XrA6za3k7Yt9KXHiA-EDa6LvA2iop82SbJTifgHuc79itb36Uax4O61h9zpDbhg/exec';
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Received data:', data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

function handleIndexPage() {
  initializeSoilMoistureChart();
  fetchWeatherData()
    .then(data => {
      displayWeatherData(data.homepage);
      displayNextThreeDays(data.homepage);
      displayPastMonth(data.homepage);
      updateSoilMoistureChart(data.homepage);
    });
}

function handleTodayPage() {
  addPlaceholderRows();
  fetchWeatherData()
    .then(data => {
      displayTodayData(data.today);
    });
}

function addPlaceholderRows() {
  const tableBody = document.querySelector('#weatherTable tbody');
  tableBody.innerHTML = ''; // Clear existing data

  for (let i = 0; i < 24; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${String(i).padStart(2, '0')}:00</td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
      <td class="placeholder"></td>
    `;
    tableBody.appendChild(tr);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    handleIndexPage();
  } else if (window.location.pathname.endsWith('today.html')) {
    handleTodayPage();
  }
});

function displayWeatherData(data) {
  const weatherDiv = document.getElementById('weather-data');
  const details = [
    { value: data.today.temperature, getColor: getTemperatureColor },
    { value: data.today.rain, getColor: getRainColor }
  ];

  details.forEach((detail, index) => {
    const detailElement = weatherDiv.children[index];
    const circle = detailElement.querySelector('.circle');
    const placeholder = detailElement.querySelector('.text-placeholder');

    // Update circle color
    circle.style.backgroundColor = detail.getColor(detail.value);

    // Stagger the replacement of placeholders
    setTimeout(() => {
      // Replace placeholder with actual content
      const textContent = document.createElement('span');
      textContent.className = 'text-content';
      textContent.textContent = detail.value;

      // Replace placeholder with new content
      placeholder.parentNode.replaceChild(textContent, placeholder);

      // Trigger fade-in and up animation
      setTimeout(() => {
        textContent.classList.add('animate');
      }, 50); // Small delay to ensure the animation triggers

    }, index * 200); // 200ms delay between each item
  });
}

function displayNextThreeDays(data) {
  const nextThreeDaysDiv = document.querySelector('#next-three-days > div');
  if (!nextThreeDaysDiv) {
    console.error('Could not find the next three days div');
    return;
  }

  const details = [
    { 
      value: data.nextThreeDays?.forecast || 'No forecast available', 
      getColor: getRainColor
    },
    { 
      value: data.nextThreeDays?.extremeWeather || 'No extreme weather',
      getColor: (value) => value.toLowerCase() === 'no extreme weather' ? '#A3C48D' : '#FF6347'
    }
  ];

  details.forEach((detail, index) => {
    updateDetailElement(nextThreeDaysDiv.children[index], detail);
  });
}

function displayPastMonth(data) {
  const pastMonthDiv = document.querySelector('#the-past-month > div');
  if (!pastMonthDiv) {
    console.error('Could not find the past month div');
    return;
  }

  const pastMonthData = data.babaPrediction.pastMonth;
  const detail = {
    value: pastMonthData.summary,
    getColor: () => '#A2C1DD'
  };

  updateDetailElement(pastMonthDiv.children[0], detail);
}

function updateDetailElement(element, detail) {
  if (!element) {
    console.error('Could not find detail element');
    return;
  }

  const circle = element.querySelector('.circle');
  const placeholder = element.querySelector('.text-placeholder');

  if (!circle || !placeholder) {
    console.error('Could not find circle or placeholder for detail');
    return;
  }

  const textContent = document.createElement('span');
  textContent.className = 'text-content';
  textContent.textContent = detail.value;

  circle.style.backgroundColor = detail.getColor(detail.value);

  placeholder.style.visibility = 'hidden';
  placeholder.style.display = 'none';
  element.appendChild(textContent);

  setTimeout(() => {
    element.classList.add('fade-in');
  }, 150);

  element.classList.remove('placeholder');
}

function displayTodayData(todayData) {
  const tableBody = document.querySelector('#weatherTable tbody');
  const rows = tableBody.querySelectorAll('tr');

  todayData.forEach((row, index) => {
    if (index < 24) {
      const tr = rows[index];
      const cells = tr.querySelectorAll('td');
      
      cells[0].textContent = formatTime(row.time);
      cells[1].textContent = row.temperature.toFixed(1);
      cells[2].textContent = row.humidity;
      cells[3].textContent = row.precipitation.toFixed(1);
      cells[4].textContent = row.cloudiness;
      cells[5].textContent = row.windSpeed.toFixed(1);
      cells[6].textContent = row.windDirection;
      cells[7].textContent = `${convertPARtoPhotosynthesisPercentage(row.adjustedPAR)}%`;

      // Remove placeholder class from cells and add fade-in class
      Array.from(cells).forEach(cell => {
        cell.classList.remove('placeholder');
        cell.classList.add('fade-in');
      });

      // Add fade-in class to row with a delay
      setTimeout(() => {
        tr.classList.add('fade-in');
      }, index * 100); // 100ms delay for each row
    }
  });
}

function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  // Set minutes and seconds to 0 to floor to the nearest hour
  date.setMinutes(0);
  date.setSeconds(0);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


function convertPARtoPhotosynthesisPercentage(parValue) {
  const theoreticalMaxPAR = 2000; // µmol/m²/s
  let percentage = (parValue / theoreticalMaxPAR) * 100;
  return Math.round(percentage); // Round to nearest integer
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