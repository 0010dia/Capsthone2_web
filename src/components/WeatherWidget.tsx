import React, { useState, useEffect } from "react";
import { Sun, Umbrella, Droplet } from "lucide-react";
import "../styles/WeatherWidget.css";

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{
    temp: number;
    desc: string;
    icon: string;
    location: string;
    pop: number;
    forecast: Array<{ time: string; temp: number; icon: string; pop: number }>;
  } | null>(null);

  useEffect(() => {
    const API_KEY = "77e87226bc9a970399d5ae29742c9e62";

    const fetchWeather = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude: lat, longitude: lon } = position.coords;

            try {
              const geoRes = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
              );
              const geoData = await geoRes.json();
              const realCityName =
                geoData[0]?.local_names?.ko || geoData[0]?.name;

              const weatherRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`,
              );
              const data = await weatherRes.json();
              processWeatherData(data, realCityName);
            } catch (error) {
              console.error("Weather load failed", error);
            }
          },
          (error) => {
            console.error("위치 정보를 가져오는데 실패했습니다.", error);
          },
          { enableHighAccuracy: true },
        );
      }
    };

    const processWeatherData = (data: any, cityName: string) => {
      const nowInSec = Math.floor(Date.now() / 1000);
      const futureForecast = data.list.filter(
        (item: any) => item.dt > nowInSec,
      );

      // 위젯 하단 5개 미리보기용
      const forecastList = futureForecast.slice(0, 6).map((item: any) => {
        const date = new Date(item.dt * 1000);

        return {
          time: `${date.getHours()}시`,
          temp: Math.round(item.main.temp),
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          pop: Math.round(item.pop * 100),
        };
      });

      const current = data.list[0];

      const weatherDetailInfo = {
        temp: Math.round(current.main.temp),
        feels_like: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        wind_speed: current.wind.speed,
        desc: current.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
        location: cityName,
        pop: Math.round(current.pop * 100),
        sunrise: data.city.sunrise,
        sunset: data.city.sunset,
        rawList: data.list, 
      };

      // 위젯 내부 상태 업데이트
      setWeather({
        temp: Math.round(current.main.temp),
        desc: current.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
        location: cityName,
        pop: Math.round(current.pop * 100),
        forecast: forecastList,
      });

      // 상세창(DetailView)에 데이터 전송
      window.dispatchEvent(
        new CustomEvent("weatherUpdate", { detail: weatherDetailInfo }),
      );
    };

    fetchWeather();
  }, []);

  return (
    <div className="widget weather-widget">
      <div className="widget-header">
        <Sun size={20} />{" "}
        <h3>{weather ? `${weather.location} 날씨` : "현재 날씨"}</h3>
      </div>

      {weather ? (
        <div className="weather-content">
          <div className="current-section">
            <img src={weather.icon} alt="now" className="main-icon" />
            <div className="current-info">
              <span className="main-temp">{weather.temp}°</span>
              <div className="main-desc-group">
                <span>{weather.desc}</span>
                <span className="current-pop">
                  <Umbrella size={20} color="white" />
                  {weather.pop}%
                </span>
              </div>
            </div>
          </div>

          <div className="forecast-bar">
            {weather.forecast.map((f, idx) => (
              <div key={idx} className="forecast-slot">
                <span className="f-time">{f.time}</span>
                <img src={f.icon} alt="icon" className="f-icon" />
                <span className="f-temp">{f.temp}°</span>
                <span className="f-pop">{f.pop}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="loading">날씨 데이터를 불러오는 중...</div>
      )}
    </div>
  );
};

export default WeatherWidget;
