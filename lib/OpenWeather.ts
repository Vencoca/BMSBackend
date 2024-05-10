import Logger from "./logger";

export default async function getTemperatureInPrague() {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Prague&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weatherData = await response.json();
    const temperature = weatherData.main.temp;
    return temperature;
  } catch (error) {
    Logger.debug("Error fetching weather data:", error);
    return null;
  }
}
