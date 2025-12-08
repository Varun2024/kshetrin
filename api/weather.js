import axios from 'axios';
import { apiKey } from '../constants/apiKey';

const weatherEndpoint = params => `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${params.cityName}&aqi=no`

const getWeatherData = async (params    ) => {
    try {
        const response = await axios.get(weatherEndpoint(params));
        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }   
};

export default getWeatherData;