const axios = require('axios');

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';


const cache = {};
const CACHE_TTL = 10 * 60 * 1000; 


const requestLog = [];
const RATE_LIMIT = 50; 
const RATE_WINDOW = 60 * 1000; 

const isRateLimited = () => {
  const now = Date.now();
  const recentRequests = requestLog.filter(t => now - t < RATE_WINDOW);
  requestLog.length = 0;
  recentRequests.forEach(t => requestLog.push(t));
  return recentRequests.length >= RATE_LIMIT;
};

const getWeatherByCity = async (city) => {
  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  
  const cacheKey = city.toLowerCase();
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, fromCache: true };
  }

  
  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    requestLog.push(Date.now());

    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'ar'
      },
      timeout: 5000 
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      wind_speed: response.data.wind.speed,
      visibility: response.data.visibility,
      conditions: response.data.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}.png`,
      affects_mobility: ['Rain', 'Snow', 'Thunderstorm', 'Fog', 'Mist'].includes(response.data.weather[0].main),
      retrieved_at: new Date().toISOString()
    };

    
    cache[cacheKey] = { data, timestamp: Date.now() };

    return data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Weather service timeout. Please try again.');
    }
    if (error.response?.status === 404) {
      throw new Error(`City "${city}" not found.`);
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid Weather API key.');
    }
    throw new Error('Failed to fetch weather data.');
  }
};

const getWeatherByCoords = async (lat, lon) => {
  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  const cacheKey = `${lat},${lon}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, fromCache: true };
  }

  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    requestLog.push(Date.now());

    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'ar'
      },
      timeout: 5000
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      wind_speed: response.data.wind.speed,
      visibility: response.data.visibility,
      conditions: response.data.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}.png`,
      affects_mobility: ['Rain', 'Snow', 'Thunderstorm', 'Fog', 'Mist'].includes(response.data.weather[0].main),
      retrieved_at: new Date().toISOString()
    };

    cache[cacheKey] = { data, timestamp: Date.now() };

    return data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Weather service timeout. Please try again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Location not found.');
    }
    throw new Error('Failed to fetch weather data.');
  }
};

module.exports = { getWeatherByCity, getWeatherByCoords };
