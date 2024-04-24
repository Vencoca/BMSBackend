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
    console.error("Error fetching weather data:", error);
    return null; // Return null or handle the error in your application
  }
}
