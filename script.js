let soilMoistureChart = null;
let babaData = null;

function initializeSoilMoistureChart() {
  const ctx = document.getElementById('soilMoistureChart').getContext('2d');
  
  soilMoistureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'],
      datasets: [{
        data: Array(7).fill(0),
        borderColor: '#0461F9',
        backgroundColor: 'rgba(4, 97, 249, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#0461F9',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
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

  const moistureData = data.conditions.soilMoisture.scores.reverse();
  soilMoistureChart.data.datasets[0].data = moistureData;
  soilMoistureChart.update();

  updateMoistureLabels(moistureData[moistureData.length - 1]);

  const headerElement = document.querySelector('#soil-moisture .card-header');
  if (headerElement) {
    updateHeaderElement(headerElement, {
      value: data.conditions.header.status
    });
  }
}

function displayBestToPlant(data) {
  babaData = data; // Store the entire data object

  const bestToPlantDiv = document.querySelector('#best-to-plant');
  if (!bestToPlantDiv) {
    console.error('Could not find the best to plant div');
    return;
  }

  const headerElement = bestToPlantDiv.querySelector('.card-header');
  const detailElement = bestToPlantDiv.querySelector('.detail');

  if (headerElement) {
    updateHeaderElement(headerElement, {
      value: data.bestToPlant.mainInfo
    });
  }

  if (detailElement) {
    const detail = {
      value: data.bestToPlant.description,
      getColor: () => '#A3C48D'
    };
    updateDetailElement(detailElement, detail);
  }
}

function updateHeaderElement(element, detail) {
  if (!element) {
    console.error('Could not find header element');
    return;
  }

  const placeholder = element.querySelector('.text-placeholder');

  if (!placeholder) {
    console.error('Could not find placeholder for header');
    return;
  }

  // Remove the placeholder
  placeholder.remove();

  // Set the text content
  element.textContent = detail.value;

  // Remove the placeholder class and add fade-in class
  element.classList.remove('placeholder');
  element.classList.add('fade-in');
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
  const url = 'https://script.google.com/macros/s/AKfycbykr2iKjOSvJq5NLxzR6unDb4iXNVV4GoeWnqs330jG8UyP4DJAJ6_1KjzGYLwxmUmrCA/exec';
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Received data:', JSON.stringify(data, null, 2));
      babaData = data; // Store the entire data object
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

function handleIndexPage() {
  initializeSoilMoistureChart();

  // Show placeholders
  const weatherDiv = document.getElementById('weather-data');
  Array.from(weatherDiv.children).forEach(item => {
    item.querySelector('.circle').style.backgroundColor = '#C5C3C0';
    item.querySelector('.text-placeholder').style.display = 'inline-block';
  });

  fetchWeatherData()
    .then(data => {
      displayWeatherData(data.homepage);
      displayNextThreeDays(data.homepage);
      displayPastMonth(data.homepage);
      updateSoilMoistureChart(data.homepage);
      displayBestToPlant(data);  // Pass the entire data object
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
  } else if (window.location.pathname.endsWith('recent-weather.html')) {
    handleRecentWeatherPage();
  }

  const reRollButton = document.getElementById('re-roll');
  if (reRollButton) {
    reRollButton.addEventListener('click', reRollBestToPlant);
  }

  const clickableElements = [
    { id: 'soil-moisture', destination: 'early-access.html' },
    { id: 'see-all-plants', destination: 'early-access.html' },
	  { id: 'add-crop-card', destination: 'early-access.html' },
	  { id: 'location', destination: 'early-access.html' },
	  { id: 'logo', destination: 'index.html' },
	  { id: 'soil-moisture', destination: 'recent-weather.html' }
    // Add more elements here as needed
  ];

  function makeClickable(element, destination) {
    if (element) {
      element.style.cursor = 'pointer';
      element.addEventListener('click', function() {
        window.location.href = destination;
      });
    }
  }

  clickableElements.forEach(item => {
    const element = document.getElementById(item.id);
    makeClickable(element, item.destination);
  });

  initWaitlistForm();
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
      // Create new text content element
      const textContent = document.createElement('span');
      textContent.className = 'text-content';
      textContent.textContent = detail.value;

      // Replace placeholder with new content
      detailElement.replaceChild(textContent, placeholder);

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

function animateRoll(plants, duration = 2000) {
  const headerElement = document.querySelector('#best-to-plant .card-header');
  const detailElement = document.querySelector('#best-to-plant .detail');
  
  let startTime;
  const totalPlants = plants.length;
  
  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;
    
    // Calculate the current plant index based on elapsed time
    const progress = Math.min(elapsedTime / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    const currentIndex = Math.floor(easedProgress * totalPlants);
    
    if (currentIndex < totalPlants) {
      const plant = plants[currentIndex];
      
      if (headerElement) {
        headerElement.textContent = plant.name;
      }
      
      if (detailElement) {
        detailElement.querySelector('.text-content').textContent = plant.location;
      }
      
      requestAnimationFrame(animate);
    } else {
      // Animation complete, set final values
      const finalPlant = plants[totalPlants - 1];
      if (headerElement) {
        headerElement.textContent = finalPlant.name;
      }
      if (detailElement) {
        detailElement.querySelector('.text-content').textContent = finalPlant.location;
      }
    }
  }
  
  requestAnimationFrame(animate);
}

function reRollBestToPlant() {
  if (!babaData || !babaData.bestToPlant || !Array.isArray(babaData.bestToPlant.plants) || babaData.bestToPlant.plants.length === 0) {
    console.error('Best to plant data is not available or invalid');
    return;
  }
  
  // Shuffle the plants array
  const shuffledPlants = [...babaData.bestToPlant.plants].sort(() => Math.random() - 0.5);
  
  animateRoll(shuffledPlants);
}

// BABA.earth Waitlist Form Script
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const iframe = document.getElementById('hidden_iframe');
  if (!form || !iframe) return;

  let isSubmitting = false;
  let originalButtonText = '';

  form.addEventListener('submit', function(e) {
    if (isSubmitting) {
      e.preventDefault();
      console.log('Form is already being submitted');
      return;
    }

    isSubmitting = true;
    const submitButton = form.querySelector('button[type="submit"]');
    originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    // Set a timeout to reset the form state if we don't get a response
    setTimeout(function() {
      if (isSubmitting) {
        resetFormState();
        console.log('Form submission timed out');
        alert("Hmm, something didn't go quite right. Please try again.");
      }
    }, 5000); // 5 seconds timeout
  });

  iframe.addEventListener('load', function() {
    if (!isSubmitting) return; // Ignore initial load

    resetFormState();

    // Assume success if we can't access iframe content
    let isSuccess = true;

    try {
      if (iframe.contentDocument) {
        const iframeContent = iframe.contentDocument.body.textContent.trim();
        isSuccess = iframeContent === 'success';
      }
    } catch (error) {
      console.error('Error reading iframe content:', error);
      // We'll still assume success if we can't read the content
    }

    if (isSuccess) {
      alert("You've joined Baba's circle. Together, we'll grow something wonderful.");
      form.reset();
    } else {
      alert("Hmm, something didn't go quite right. Please try again.");
    }
  });

  function resetFormState() {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    isSubmitting = false;
  }
}

function createRainChart(chartData) {
  const ctx = document.getElementById('rainChart').getContext('2d');

  // Find today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the index of today in the data
  const todayIndex = chartData.findIndex(entry => entry.date >= today);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map(entry => entry.date),
      datasets: [
        {
          label: 'Rain',
          data: chartData.map(entry => ({ x: entry.date, y: entry.precipitation })),
          backgroundColor: '#0461F9',
          borderRadius: 2,
          borderSkipped: false,
        },
        {
          label: 'Drainage',
          data: chartData.map(entry => ({ x: entry.date, y: -entry.dailyDrainage })),
          backgroundColor: '#A2C1DD',
          borderRadius: 2,
          borderSkipped: false,
        },
        {
          label: 'Evaporation',
          data: chartData.map(entry => ({ x: entry.date, y: -entry.evapotranspiration })),
          backgroundColor: '#FF6347',
          borderRadius: 2,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'd MMM'
            }
          },
          stacked: true,
          grid: {
            display: true,
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            align: 'start',
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: 12
            },
            padding: 8
          }
        },
        y: {
          position: 'right',
          stacked: true,
          title: {
            display: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context) {
              return new Date(context[0].parsed.x).toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }).replace(',', '');
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += Math.abs(context.parsed.y).toFixed(1) + ' mm';
              }
              return label;
            }
          }
        },
        legend: {
          align: 'end',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        }
      }
    },
    plugins: [{
      afterDraw: chart => {
        const { ctx, chartArea, scales } = chart;
        if (todayIndex !== -1) {
          const x = scales.x.getPixelForValue(chartData[todayIndex].date);
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.stroke();
          ctx.restore();
        }
      }
    }]
  });

  return chart;
}

function createTemperatureChart(chartData) {
  const ctx = document.getElementById('tempChart').getContext('2d');
  
  // Find today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find indices for current date and start of forecast
  const currentDateIndex = chartData.findIndex(entry => entry.date >= today);
  const forecastStartIndex = chartData.findIndex(entry => entry.type === 'Forecast');

  // Use all data, including 3 forecast days
  let chartDataToUse = chartData;
  if (forecastStartIndex !== -1) {
    const forecastData = chartData.slice(forecastStartIndex);
    const historicalData = chartData.slice(0, forecastStartIndex);
    chartDataToUse = [...historicalData, ...forecastData.slice(0, 3)];
  }

  // Find the overall temperature range
  const allTemps = chartDataToUse.flatMap(entry => [entry.minTemp, entry.maxTemp]).filter(temp => temp !== null);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);

  // Calculate y-axis bounds with 5°C increments
  const yMin = Math.floor(minTemp / 5) * 5;
  const yMax = Math.ceil(maxTemp / 5) * 5;

  // Create a temperature color scale
  const temperatureColorScale = createTemperatureColorScale(yMin, yMax);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartDataToUse.map(entry => entry.date),
      datasets: [{
        label: 'Temperature Range',
        data: chartDataToUse.map(entry => ({
          x: entry.date,
          y: entry.minTemp !== null && entry.maxTemp !== null ? [entry.minTemp, entry.maxTemp] : null
        })),
        backgroundColor: chartDataToUse.map(entry => {
          if (entry.minTemp === null || entry.maxTemp === null) {
            return 'rgba(200, 200, 200, 0.5)'; // Light gray for missing data
          }
          return ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        }),
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderRadius: 2,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'd MMM'
            }
          },
          grid: {
            display: true,
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            align: 'start',
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: 12
            },
            padding: 8
          }
        },
        y: {
          position: 'right',
          min: yMin,
          max: yMax,
          ticks: {
            stepSize: 5,
            callback: function(value) {
              return value;
            }
          },
          title: {
            display: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }).replace(',', '');
            },
            label: function(context) {
              if (context.raw.y === null) {
                return 'No data available';
              }
              const minTemp = context.raw.y[0].toFixed(1);
              const maxTemp = context.raw.y[1].toFixed(1);
              return [`Min: ${minTemp}°C`, `Max: ${maxTemp}°C`];
            }
          }
        },
        legend: {
          display: false
        }
      }
    },
    plugins: [{
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const yAxis = chart.scales.y;
        const xAxis = chart.scales.x;
        const gradient = ctx.createLinearGradient(0, yAxis.top, 0, yAxis.bottom);
        
        // Create gradient stops based on the temperature range
        for (let i = 0; i <= 100; i++) {
          const temp = yMin + (yMax - yMin) * (i / 100);
          gradient.addColorStop(1 - i / 100, temperatureColorScale(temp));
        }

        // Apply the gradient to each bar
        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].data.map(() => gradient);

        // Draw vertical line for current date
        if (currentDateIndex !== -1) {
          const x = xAxis.getPixelForValue(chartDataToUse[currentDateIndex].date);
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, yAxis.top);
          ctx.lineTo(x, yAxis.bottom);
          ctx.stroke();
          ctx.restore();
        }

        chart.update('none'); // Update without animation
      }
    }]
  });

  return chart;
}

function createTemperatureColorScale(minTemp, maxTemp) {
  const coldColor = { r: 162, g: 193, b: 221 };  // #A2C1DD for 0°C and below
  const warmColor = { r: 242, g: 201, b: 76 };   // #F2C94C for 24°C
  const hotColor = { r: 255, g: 99, b: 71 };     // #FF6347 for 35°C and above

  function interpolateColor(color1, color2, factor) {
    const result = { r: 0, g: 0, b: 0 };
    for (const key in result) {
      result[key] = Math.round(color1[key] + factor * (color2[key] - color1[key]));
    }
    return result;
  }

  return function(temp) {
    if (temp <= 0) return `rgb(${coldColor.r}, ${coldColor.g}, ${coldColor.b})`;
    if (temp >= 35) return `rgb(${hotColor.r}, ${hotColor.g}, ${hotColor.b})`;

    let startColor, endColor, percentage;
    if (temp < 24) {
      startColor = coldColor;
      endColor = warmColor;
      percentage = temp / 24;
    } else {
      startColor = warmColor;
      endColor = hotColor;
      percentage = (temp - 24) / 11;  // 11 is the range between 24 and 35
    }

    const interpolatedColor = interpolateColor(startColor, endColor, percentage);
    return `rgb(${interpolatedColor.r}, ${interpolatedColor.g}, ${interpolatedColor.b})`;
  };
}

function handleRecentWeatherPage() {
  const rainChartContainer = document.querySelector('#soil-moisture-changes .chart-container');
  const tempChartContainer = document.querySelector('#temperature .chart-container');
  
  if (rainChartContainer) {
    rainChartContainer.innerHTML = '<canvas id="rainChart"></canvas>';
  }
  if (tempChartContainer) {
    tempChartContainer.innerHTML = '<canvas id="tempChart"></canvas>';
  }

  fetchWeatherData()
    .then(data => {
      console.log('Received data:', data);
      
      if (!data.dailyWeatherData || !Array.isArray(data.dailyWeatherData)) {
        throw new Error('Daily weather data is missing or in an unexpected format');
      }

      // Process the new dailyWeatherData
      let chartData = data.dailyWeatherData.map(entry => {
        if (!entry || typeof entry.date !== 'string') {
          console.error('Invalid entry in daily weather data:', entry);
          return null;
        }
        return {
          date: new Date(entry.date.split('T')[0]), // Remove time part and create Date object
          precipitation: entry.precipitation || 0,
          dailyDrainage: entry.dailyDrainage || 0,
          evapotranspiration: entry.evapotranspiration || 0,
          minTemp: entry.minTemp,
          maxTemp: entry.maxTemp,
          meanTemp: entry.meanTemp,
          type: entry.type || 'Historical' // Assume 'Historical' if not specified
        };
      }).filter(entry => entry !== null);

      console.log('Processed daily weather data:', chartData);

      chartData.sort((a, b) => a.date - b.date);

      // Split the data for rain and temperature charts
      const rainChartData = chartData.map(entry => ({
        date: entry.date,
        precipitation: entry.precipitation,
        dailyDrainage: entry.dailyDrainage,
        evapotranspiration: entry.evapotranspiration
      }));

      const tempChartData = chartData.map(entry => ({
        date: entry.date,
        minTemp: entry.minTemp,
        maxTemp: entry.maxTemp,
        meanTemp: entry.meanTemp,
        type: entry.type
      }));

      if (rainChartData.length === 0 || tempChartData.length === 0) {
        throw new Error('No data available for the selected date range');
      }

      createRainChart(rainChartData);
      createTemperatureChart(tempChartData);

      // Scroll both charts to the right end
      setTimeout(() => {
        const rainContainer = document.querySelector('.rain-content');
        const tempContainer = document.querySelector('.temperature-content');
        if (rainContainer) rainContainer.scrollLeft = rainContainer.scrollWidth;
        if (tempContainer) tempContainer.scrollLeft = tempContainer.scrollWidth;
      }, 100);
    })
    .catch(error => {
      console.error('Error in handleRecentWeatherPage:', error);
      if (rainChartContainer) {
        rainChartContainer.innerHTML = `<p>Error loading chart data: ${error.message}. Please try again later.</p>`;
      }
      if (tempChartContainer) {
        tempChartContainer.innerHTML = `<p>Error loading chart data: ${error.message}. Please try again later.</p>`;
      }
    });
}