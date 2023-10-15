


// URLs
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?';

// HTML Selectors
const mainSelector = document.getElementById("main");
const geolocationLink = document.getElementById("geolink");
const weatherPlaceholder = document.querySelector('.weather');
const searchBar = document.getElementById('search-bar');
const forecastPlaceholder = document.querySelector('.forecast');
const descriptionPlaceholder = document.getElementById('description');
const fahrenheitController = document.getElementById('control-f');
const celciusController = document.getElementById('control-c');
const controlPlaceHolder = document.querySelector(".control");

let temperatureMeasurementSetting = 'celcius';

const fetchWeather = async ({
  city,
  lat,
  lon,
}) => {
  let url = `${weatherUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${weatherUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);

    return json;
  } catch (e) {
    console.error(e);
  }
 
};

const fetchForecast = async ({
  city,
  lat,
  lon,
}) => {
  let url = `${forecastUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${forecastUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);

    return json;
  } catch (e) {
    console.error(e);
  }
};

const getUserLocation = async () => {
   return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );
};

const getUserLatLong = async () => {
  try {
    const position = await getUserLocation();
    return position.coords;
  } catch (e) {
    console.error(e);
  }
};

const celsiusToFahrenheit = celsius => {
  return celsius * 9/5 + 32;
};

const filterFutureForecast = forecastList => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const forecastCombined =  forecastList.reduce((acc, forecast) => {
    const systemDate = new Date();
    const forecastDateReadable = new Date(forecast.dt * 1000);
    const forecastDate = forecast.dt_txt.split(" ")[0];

    if (!acc.hasOwnProperty(forecastDate)) {
      acc[forecastDate] = {
        highC: Number.MIN_VALUE,
        lowC: Number.MAX_VALUE,
        highF: Number.MIN_VALUE,
        lowF: Number.MAX_VALUE,
        date: forecastDate,
        day: systemDate.getDay() === forecastDateReadable.getDay() ? 'Today' : days[forecastDateReadable.getDay()],
      };
    }
    if (forecast.main.temp_max > acc[forecastDate].highC) {
      acc[forecastDate].highC = Math.round(forecast.main.temp_max);
      acc[forecastDate].highF = Math.round(celsiusToFahrenheit(forecast.main.temp_max));
    }
    if (forecast.main.temp_min < acc[forecastDate].lowC) {
      acc[forecastDate].lowC = Math.round(forecast.main.temp_min);
      acc[forecastDate].lowF = Math.round(celsiusToFahrenheit(forecast.main.temp_min));
    }
    return acc;
  }, {});

  return Object.values(forecastCombined).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
};

const displayFutureForecast = forecastList => {
  let futureforecastList = '';
  forecastList.forEach(forecast => {
    futureforecastList += `
      <div>
        <p>${forecast.day}</p>
        <p class="celcius">${forecast.lowC}°C / ${forecast.highC}°C </p>
        <p class="fahrenheit">${forecast.lowF}°F / ${forecast.highF}°F </p>
      </div>
    `
  });
  return futureforecastList;
};

const getTime = (time, timezone) => {
  const timeReadable = new Date((time + timezone) * 1000);

   // we need to get the timezone offset so we can show it in the local time
  // instead of GMT
  const timezoneOffset = timeReadable.getTimezoneOffset() / 60;

  return `${timeReadable.getHours() + timezoneOffset}.${timeReadable.getMinutes().toString().padStart(2, "0")}`
};

const showDescription = (city, description) => {
  mainSelector.classList.remove(...mainSelector.classList);
  // description = 'Sno';
  switch (description) {
    case 'Clear':
      descriptionPlaceholder.innerHTML = `Get your sunnies on. ${city} is looking rather great today.`;
      icon.src = "./icons/sunglasses.svg";
      mainSelector.classList.add("sunny");
      break;
    case 'Clouds':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} is looking grey today.`;
      icon.src = "./icons/clouds.svg";
      mainSelector.classList.add("cloudy");
      break;
    case 'Rain':
    case 'Thunderstorm':
    case 'Drizzle':
    case 'Mist':
      descriptionPlaceholder.innerHTML = `Don't forget your umbrella. It's wet in ${city} today.`;
      icon.src = "./icons/umbrella.svg"
      mainSelector.classList.add("rainy");
      break;
    case 'Snow':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} looks snowy today.`;
      icon.src = "./icons/snow.svg";
      mainSelector.classList.add("snow");
      break;
    default:
      descriptionPlaceholder.innerHTML = `Be careful today in ${city}!`;
      icon.src = "./icons/unknown.svg";
      mainSelector.classList.add("unknown");
  };
};

const displayTemperatureMeasurementSetting = () => {
  if (temperatureMeasurementSetting === 'celcius') {
    celciusController.innerHTML = `
      <b>Celcius</b>
    `;
    fahrenheitController.innerHTML = `
      <a href="javascript:void(0)">Fahrenheit</a>
    `;
  } else {
    celciusController.innerHTML = `
      <a href="javascript:void(0)">Celcius</a>
    `;
    fahrenheitController.innerHTML = `
      <b>Fahrenheit</b>
    `;
  }
};

const displayWeather = (weather, forecast) => {
  const { name, timezone } = weather;
  const { sunrise, sunset } = weather.sys;
  const { temp, feels_like: feelsLike } = weather.main;
  const { main, description } = weather.weather[0];

  const futureForecast = filterFutureForecast(forecast.list);

  const weatherOutput = `
    <p class="celcius">
      ${description} | ${Math.round(temp)} °C
    </p>
    <p class="celcius">
      feels like ${Math.round(feelsLike)} °C
    </p>
    <p class="fahrenheit">
      ${description} | ${Math.round(celsiusToFahrenheit(temp))} °F
    </p>
    <p class="fahrenheit">
      feels like ${Math.round(celsiusToFahrenheit(feelsLike))} °F
    </p>
    <p>
      sunrise ${getTime(sunrise, timezone)}
    </p>
    <p>
      sunset ${getTime(sunset, timezone)}
    </p>
  `;
  weatherPlaceholder.innerHTML = weatherOutput;

  forecastPlaceholder.innerHTML = `${displayFutureForecast(futureForecast)}`;
  showDescription(name, main);

  if (temperatureMeasurementSetting === 'fahrenheit') {
    const celciusSelector = document.querySelectorAll('.celcius');
    celciusSelector.forEach(element => {
      element.style.display = 'none';
    });
  } else {
    const fahrenheitSelector = document.querySelectorAll('.fahrenheit');
    fahrenheitSelector.forEach(element => {
      element.style.display = 'none';
    });
  }
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  searchBar.value = '';
  const weather = await fetchWeather({city: searchBarText});
  const forecast = await fetchForecast({city: searchBarText});
  displayWeather(weather, forecast);
};

geolocationLink.onclick = async () => {
  const { latitude: lat, longitude: lon } = await getUserLatLong();
  const weather = await fetchWeather({lat, lon});
  const forecast = await fetchForecast({lat, lon});
  displayWeather(weather, forecast);
};

fahrenheitController.onclick = () => {
  const fahrenheitSelector = document.querySelectorAll('.fahrenheit');
  const celciusSelector = document.querySelectorAll('.celcius');
  fahrenheitSelector.forEach(element => {
    element.style.display = 'flex';
  });
  celciusSelector.forEach(element => {
    element.style.display = 'none';
  });
  temperatureMeasurementSetting = 'fahrenheit';
  displayTemperatureMeasurementSetting();
};

celciusController.onclick = () => {
  const celciusSelector = document.querySelectorAll('.celcius');
  const fahrenheitSelector = document.querySelectorAll('.fahrenheit');
  celciusSelector.forEach(element => {
    element.style.display = 'flex';
  });
  fahrenheitSelector.forEach(element => {
    element.style.display = 'none';
  });
  temperatureMeasurementSetting = 'celcius';
  displayTemperatureMeasurementSetting();
};

(async() => {
  const initialWeather = await fetchWeather({city: 'stockholm'});
  const initialForecast = await fetchForecast({city: 'stockholm'});
  displayWeather(initialWeather, initialForecast);
  displayTemperatureMeasurementSetting();
})();