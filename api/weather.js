// import axios from "axios";
// import { apiKey } from "../constants/apiKey";

// const weatherEndpoint = (params) =>
//   `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${params.cityName}&aqi=no`;

// const getWeatherData = async (endPoint) => {
//   try {
//     const response = await axios.get(endPoint);
//     console.log("data", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     throw error;
//   }
// };

// const fetchWeatherData = (params) => {
//   return getWeatherData(weatherEndpoint(params));
// };

// export default fetchWeatherData;

import axios from "axios";
import { apiKey } from "../constants/apiKey";

const weatherEndpoint = ({ cityName }) =>
  `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
    cityName
  )}&aqi=no`;

const getWeatherData = async (url) => {
  try {
    const { data } = await axios.get(url);
    // console.log("Weather Data:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching weather data:", error?.response?.data || error);
    throw error;
  }
};

const fetchWeatherData = (params) => {
  if (!params?.cityName) {
    throw new Error("cityName is required");
  }
  return getWeatherData(weatherEndpoint(params));
};

export default fetchWeatherData;
