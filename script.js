const apiKey1 = 'c01790319b2a0d3d9189e9847c3c945a';
const apiKey2 = 'zCaVs0NuMuPDqhi6B6_n-06vV3In5kdUmExvnfwhyZM'
const input = document.getElementById('city');
const button = document.querySelector('button');
const temperature = document.querySelector('h2')
const cityTitle = document.querySelector('h3');
const forecast = document.querySelector('.forecast');
let myChart = document.getElementById('myChart').getContext('2d');
const today = new Date();
const currentDate = today.toISOString().slice(0, 10);
let tempChart = 0;

const saveLastCity = (city) => {
    localStorage.setItem('lastCity', city);
};
const getLastCity = () => {
    return localStorage.getItem('lastCity') || ''; // If not found, return empty string
};

const isPast3PM = () => {
    const currentHour = today.getHours();
    return currentHour >= 15;
};

const getNextFiveDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const nextFiveDays = [];
    if (isPast3PM()) {
        for (let i = 1; i <= 5; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            const dayName = days[nextDay.getDay()];
            nextFiveDays.push(dayName);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            const dayName = days[nextDay.getDay()];
            nextFiveDays.push(dayName);
        }
    }
    return nextFiveDays;
};
const nextFiveDays = getNextFiveDays();

const getImage = async (city) => {
    const response = await fetch(`https://api.unsplash.com/photos/random/?count=1&query=${city}&client_id=${apiKey2}`);
    return response.json();
}

const getWeather = async (city) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey1}`);
    return response.json();
}

const getForecast = async (city) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey1}`);
    return response.json();
}
const cleanResults = () => {
    return new Promise((resolve, reject) => {
        for (let i = 1; i <= 5; i++) {
            const dayDiv = document.querySelector(`.day${i}`);
            while (dayDiv.firstChild) {
                dayDiv.removeChild(dayDiv.firstChild);
            }
        }
        resolve();
    })
}
const createChart = (receivedTemps) => {
    Chart.defaults.color = '#FFF';
    Chart.defaults.borderColor = '#BBB';
    Chart.defaults.textShadow = '1px 1px 2px black';
    tempChart = new Chart(myChart, {
        type: 'line',
        data: {
            labels: nextFiveDays,
            datasets: [{
                label: '°C',
                data: receivedTemps,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.9)',
                    'rgba(54, 162, 235, 0.9)',
                    'rgba(255, 206, 86, 0.9)',
                    'rgba(75, 192, 192, 0.9)',
                    'rgba(153, 102, 255, 0.9)'
                ],
                borderColor: '#FFF',

            }]
        },
        options: {}
    })
}
const attachResults = async (data) => {
    try {
        const receivedTemps = [];
        let count = 0;

        for (let i = 0; i < data.list.length; i++) {
            const forecastItem = data.list[i];

            if (forecastItem.dt_txt.includes("15:00:00") && !forecastItem.dt_txt.includes(currentDate)) {
                count++;
                const dayDiv = document.querySelector(`.day${count}`);
                const dayTitle = document.createElement('h3');
                const weatherIcon = document.createElement('img');
                const dayTemp = document.createElement('h4');
                dayTitle.innerText = nextFiveDays[count - 1];
                weatherIcon.src = `https://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@4x.png`;
                dayTemp.innerText = forecastItem.main.temp_max.toFixed(1) + '°C';
                dayDiv.appendChild(dayTitle);
                dayDiv.appendChild(weatherIcon);
                dayDiv.appendChild(dayTemp);
                receivedTemps.push(forecastItem.main.temp_max.toFixed(1));

                // Break the loop
                if (count === 5) {
                    break;
                }
            }
        }

        createChart(receivedTemps);
    } catch (e) {
        console.log('Missing data', e);
    }
}

const retrieveWeather = async () => {
    try {
        const city = input.value;
        const data = await getWeather(city);
        temperature.innerText = data.main.temp.toFixed(1) + '°C';
        cityTitle.innerText = data.name;
    } catch (e) {
        console.log('Weather not found', e);
        cityTitle.innerText = 'Not found';
    }
};
const retrieveForecast = async () => {
    try {
        await cleanResults();
        if (tempChart !== 0) {
            tempChart.destroy();
        }
        const city = input.value;
        const data = await getForecast(city);
        console.log(data)
        attachResults(data);
    } catch (e) {
        console.log('Weather not found', e);
        cityTitle.innerText = 'Not found';
    }
}
const attachImage = async () => {
    try {
        const city = input.value;
        const data = await getImage(city);
        const bg = document.querySelector('.bg');
        const container = document.querySelector('.container');
        container.style.backgroundColor = 'transparent'
        if (data.errors) {
            bg.src = 'default.jpg';
        } else {
            bg.src = data[0].urls.regular;
        }

    } catch (e) {
        console.log('Could not attach image', e)
    }
}

// Load the last searched city (if any)
window.addEventListener('load', async () => {
    const lastCity = getLastCity();
    if (lastCity) {
        input.value = lastCity;
        await retrieveWeather();
        await retrieveForecast();
        await attachImage();
        forecast.style.backgroundColor = 'rgba(0, 3, 24, 0.289)';
        const canvas = document.querySelector('canvas');
        canvas.style.backgroundColor = 'rgba(2, 0, 19, 0.489)';
    }
});

button.addEventListener('click', async () => {
    const city = input.value;
    await retrieveWeather();
    await retrieveForecast();
    await attachImage();
    saveLastCity(city);
    forecast.style.backgroundColor = 'rgba(0, 3, 24, 0.289)';
    const canvas = document.querySelector('canvas');
    canvas.style.backgroundColor = 'rgba(2, 0, 19, 0.489)';
});

input.addEventListener('keydown', async (e) => {
    if (e.code === 'Enter') {
        const city = input.value;
        await retrieveWeather();
        await retrieveForecast();
        await attachImage();
        saveLastCity(city);
        forecast.style.backgroundColor = 'rgba(0, 3, 24, 0.289)';
        const canvas = document.querySelector('canvas');
        canvas.style.backgroundColor = 'rgba(2, 0, 19, 0.489)';
    }
});
