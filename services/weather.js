const axios = require("axios");

const API_KEY = process.env.API_KEY;

const getWeatherData = async (address, fromDate, toDate) => {
  const { data } = await axios.get(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${address}/${fromDate}/${toDate}?key=${API_KEY}`
  );
  return data.days;
};

module.exports = {
  getWeatherData,
};
