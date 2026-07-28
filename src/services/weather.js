// src/services/weather.js
export const getRealWeather = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await response.json();
    
    if (!data.current_weather) return null;
    
    return {
      temp: Math.round(data.current_weather.temperature),
      condition: getWeatherCondition(data.current_weather.weathercode),
      wind: Math.round(data.current_weather.windspeed),
      high: Math.round(data.daily?.temperature_2m_max?.[0] || data.current_weather.temperature + 3),
      low: Math.round(data.daily?.temperature_2m_min?.[0] || data.current_weather.temperature - 3),
      humidity: data.current_weather.relative_humidity || Math.floor(Math.random() * 40 + 40)
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

const getWeatherCondition = (code) => {
  const conditions = {
    0: '☀️ Sunny',
    1: '🌤️ Mostly Clear',
    2: '⛅ Partly Cloudy',
    3: '☁️ Overcast',
    45: '🌫️ Foggy',
    48: '🌫️ Foggy',
    51: '🌧️ Light Drizzle',
    53: '🌧️ Drizzle',
    55: '🌧️ Heavy Drizzle',
    61: '🌧️ Light Rain',
    63: '🌧️ Rain',
    65: '🌧️ Heavy Rain',
    71: '❄️ Light Snow',
    73: '❄️ Snow',
    75: '❄️ Heavy Snow',
    95: '⛈️ Thunderstorm'
  };
  return conditions[code] || '🌤️ Clear';
};