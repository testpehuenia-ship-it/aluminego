export interface WeatherCurrent {
  temperature: number;
  windSpeed: number;
  humidity: number;
  apparentTemperature: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface WeatherDaily {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitationSum: number[];
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily;
}

export async function getAluminéWeather(): Promise<WeatherData | null> {
  try {
    // Coordenadas aproximadas de Aluminé
    const lat = -39.2372;
    const lon = -70.9314;
    const timezone = 'America/Argentina/Salta';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=${encodeURIComponent(timezone)}`;

    const res = await fetch(url, {
      next: { revalidate: 1800 } // Cachear por 30 minutos (1800 segundos)
    });

    if (!res.ok) {
      console.error('Failed to fetch weather data');
      return null;
    }

    const data = await res.json();

    return {
      current: {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        time: data.current.time
      },
      daily: {
        time: data.daily.time,
        weatherCode: data.daily.weather_code,
        temperatureMax: data.daily.temperature_2m_max,
        temperatureMin: data.daily.temperature_2m_min,
        precipitationSum: data.daily.precipitation_sum
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

