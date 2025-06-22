var map = L.map('map', {
  center: [18.9712, -72.2852], zoom: 8
});

var myStyle = {
  "weight": 2,
  "opacity": 0.65,
};

let daily = {
  Sunday: {
    weatherCode: 0,
    temp: 0
  },
  Monday: {
    weatherCode: 0,
    temp: 0
  },
  Tuesday: {
    weatherCode: 0,
    temp: 0
  },
  Wednesday: {
    weatherCode: 0,
    temp: 0
  },
  Thursday: {
    weatherCode: 0,
    temp: 0
  },
  Friday: {
    weatherCode: 0,
    temp: 0
  },
  Saturday: {
    weatherCode: 0,
    temp: 0
  }
};

var geojsonLayer;

var stars = Array.from(document.getElementsByClassName("buttonimage"))
var starsValues = [false, false, false, false, false]

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; Carto & OpenStreetMap',
  subdomains: 'abcd',
  maxZoom: 15
}).addTo(map);

function onEachFeature(feature, layer) {
  if (feature.properties) {


    const name = feature.properties.NAME_2 + ", " + feature.properties.NAME_1;
    layer.bindPopup(`<strong>${name}</strong>`);
    layer.on('click', () => {
      geojsonLayer.eachLayer(l => geojsonLayer.resetStyle(l));

      layer.setStyle({ ...myStyle, color: "blue" });
      document.getElementById("location").innerHTML = name;

      const centroid = turf.centroid(feature);
      const [lng, lat] = centroid.geometry.coordinates;

      setLocation({ lat: lat, lng: lng })
    });

  }
}


fetch('gadm41_HTI_2.json') //https://gadm.org/download_country.html level 1 of just deparments. Maybe do level 2
  .then(res => res.json())
  .then(geojson => {
    geojsonLayer = L.geoJSON(geojson, {
      style: myStyle,
      onEachFeature: onEachFeature
    }).addTo(map);
  }
  )

function setLocation(coords) {
  url = "https://api.open-meteo.com/v1/forecast?latitude=" + coords.lat + "&longitude=" + coords.lng + "&current=temperature_2m,apparent_temperature,precipitation,weather_code&hourly=is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America%2FNew_York"
  getWeatherData(url);
}

function getWeatherData(url) {
  for (let i = 0; i < 7; i++) {
    const li = document.getElementById("day" + i)
    li.children[1].innerHTML = "DOTW Weather"
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      data = data;
      setDailyData(data);
      updateIcons(data)
      updateTemp(data)
    });
  document.getElementById("place-info").style.display = "contents";
}

function setDailyData(data) {
  const date = data.daily.time[0].split("-");
  const todaysDay = getWeekDay(date);

  for (let i = 0; i < 7; i++) {
    const li = document.getElementById("day" + i)
    let day = (dayToInt(todaysDay) + i) % 7
    li.children[1].innerHTML = li.children[1].innerHTML.replace("DOTW", intToDay(day))
    daily[intToDay(day)].temp = Math.round((data.daily.temperature_2m_max[day] + data.daily.temperature_2m_min[day]) / 2);
    daily[intToDay(day)].weatherCode = data.daily.weather_code[day];
  }
}

function getWeekDay(date) {
  // (Year Code + Month Code + Century Code + Date Number - Leap Year Code) mod 7
  // (YY + (YY div 4)) mod 7
  const yearCode = (parseInt(date[0]) % 100 + Math.floor(((parseInt(date[0]) % 100) / 4))) % 7;

  //month code 033614625035
  const mCodes = "033614625035";
  const monthCode = parseInt(mCodes[parseInt(date[1]) - 1]);

  let centuryCode = 0;
  if (parseInt(date[0]) <= 2099) {
    centuryCode = 6;
  } else if (parseInt(date[0]) <= 2199) {
    centuryCode = 4;
  } else if (parseInt(date[0]) <= 2299) {
    centuryCode = 2;
  }

  const dateNumber = parseInt(date[2]);

  let leapYearCode = 0;
  if (isLeapYear(date[0]) && (date[0] == 1 || date[0] == 2)) {
    leapYearCode = 1;
  }

  const weekDayInt = (yearCode + monthCode + centuryCode + dateNumber - leapYearCode) % 7;

  return (intToDay(weekDayInt))
}

function intToDay(num) {
  switch (num) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "none";
  }
}

function dayToInt(day) {
  switch (day) {
    case "Sunday":
      return 0;
    case "Monday":
      return 1;
    case "Tuesday":
      return 2;
    case "Wednesday":
      return 3;
    case "Thursday":
      return 4;
    case "Friday":
      return 5;
    case "Saturday":
      return 6;
    default:
      return -1;
  }
}

function isLeapYear(year) {
  if (year % 4 == 0) {
    if (year % 100 == 0) {
      if (year % 400 == 0) {
        return true;
      }
      return false;
    }
    return true;
  }
  return false;
}

function getIcon(code, isDay) {
  switch (code) {
    case 0:
    case 1:
      if (isDay) return "day";
      return "night";
    case 2:
    case 3:
      return "overcast";
    case 45:
    case 48:
      return "fog";
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "drizzle"
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "rain";
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "snow";
    case 95:
      return "thunderstorms";
    case 96:
    case 99:
      return "thunderstorms-rain";
    default:
      return "unknown";
  }
}

function updateIcons(data) {
  const date = data.daily.time[0].split("-");
  const todaysDay = getWeekDay(date);

  for (let i = 0; i < 7; i++) {
    day = intToDay((dayToInt(todaysDay) + i) % 7);
    console.log(daily[day]);
    setIcon("day" + String(i), getIcon(daily[day].weatherCode));
  }
}

function updateTemp(data) {
  const date = data.daily.time[0].split("-");
  const todaysDay = getWeekDay(date);

  for (let i = 0; i < 7; i++) {
    day = intToDay((dayToInt(todaysDay) + i) % 7);
    console.log(daily[day]);
    setTemp("day" + String(i), daily[day].temp);
  }
}

function setIcon(id, value, { parent = document } = {}) {
  parent.getElementById(id).children[0].src = "/images/icons/" + value + ".svg";
  console.log(parent.getElementById(id))

}

function setTemp(id, value, { parent = document } = {}) {
  day = parent.getElementById(id).children[1].innerHTML.split(" ")[0]
  parent.getElementById(id).children[1].innerHTML = parent.getElementById(id).children[1].innerHTML.replace("Weather", value + "°F")
}

for (let i = 0; i < stars.length; i++) {
  stars[i].addEventListener("click", () => {
    starsValues = [false, false, false, false, false];
    for (let j = 0; j <= i; j++) {
      starsValues[j] = true;
    }
    console.log("clicked")
    for (let j = 0; j < stars.length; j++) {
      if (starsValues[j]) {
        stars[j].children[0].src = "images/stars/filledStar.png"
      } else {
        stars[j].children[0].src = "images/stars/emptyStar.png"
      }
    }
  })
}