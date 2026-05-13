import React from "react";
import "../styles/WeatherDetailView.css";

import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  CloudDrizzle,
  CloudFog,
  Droplet,
  Wind,
  Thermometer,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
} from "lucide-react";

const WeatherDetailView: React.FC<{ data: any }> = ({ data }) => {
  if (!data)
    return <div className="loading-text">날씨 정보를 불러오는 중...</div>;

  const hourlyForecast = data.rawList?.slice(0, 8) || [];

  const getWeeklyData = () => {
    const list = data.rawList || [];

    const days: any = {};

    list.forEach((item: any) => {
      const dateObj = new Date(item.dt * 1000);

      const dateKey = dateObj.toLocaleDateString("ko-KR");

      const hour = dateObj.getHours();

      if (!days[dateKey]) {
        days[dateKey] = {
          am: null,
          pm: null,
          dt: item.dt,
        };
      }

      if (hour >= 6 && hour <= 12) days[dateKey].am = item;

      if (hour >= 13 && hour <= 18) days[dateKey].pm = item;
    });

    return Object.values(days).slice(0, 5);
  };

  const weeklyData: any[] = getWeeklyData();

  const formatTime = (unix: number) => {
    return new Date(unix * 1000).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderWeatherIcon = (icon: string, size: number = 42) => {
    switch (icon) {
      case "01d":
        return (
          <Sun size={size} color="#ffd43b" fill="#ffd43b" strokeWidth={1.5} />
        );

      case "01n":
        return (
          <Moon size={size} color="#91a7ff" fill="#91a7ff" strokeWidth={1.5} />
        );

      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        return (
          <Cloud size={size} color="#ced4da" fill="#ced4da" strokeWidth={1.5} />
        );

      case "09d":
      case "09n":
        return <CloudDrizzle size={size} color="#74c0fc" strokeWidth={1.7} />;

      case "10d":
      case "10n":
        return <CloudRain size={size} color="#4dabf7" strokeWidth={1.7} />;

      case "11d":
      case "11n":
        return <CloudLightning size={size} color="#fcc419" strokeWidth={1.7} />;

      case "13d":
      case "13n":
        return <CloudSnow size={size} color="#e7f5ff" strokeWidth={1.7} />;

      case "50d":
      case "50n":
        return <CloudFog size={size} color="#adb5bd" strokeWidth={1.7} />;

      default:
        return (
          <Cloud size={size} color="#ced4da" fill="#ced4da" strokeWidth={1.5} />
        );
    }
  };

  return (
    <div className="wd-container">
      {/* 좌측 */}
      <div className="wd-left-panel">
        {/* 메인 현재 날씨 */}
        <div className="wd-current-panel">
          <div className="wd-temp-group">
            <div className="wd-temp-row">
              <span className="wd-main-temp">{data.temp}°</span>

              <div className="wd-main-info">
                <div className="wd-main-text">
                  <div className="wd-main-desc">{data.desc}</div>

                  <div className="wd-main-pop">
                    <Umbrella size={18} color="#74c0fc" />

                    <span>{data.pop}%</span>
                  </div>
                </div>

                <div className="wd-main-icon">
                  {renderWeatherIcon(data.rawList[0].weather[0].icon, 52)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 수치 */}
        <div className="wd-metric-grid">
          {/* 기존 6개 */}

          <div className="wd-metric-box">
            <Droplet size={22} color="#74c0fc" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">습도</div>

              <span>{data.humidity}%</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Wind size={22} color="#dee2e6" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">풍속</div>

              <span>{data.wind_speed}m/s</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Thermometer size={22} color="#ff8787" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">체감온도</div>

              <span>{data.feels_like}°</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Cloud size={22} color="#ced4da" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">구름</div>

              <span>{data.rawList[0].clouds.all}%</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Gauge size={22} color="#c0eb75" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">기압</div>

              <span>{data.rawList[0].main.pressure}hPa</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Eye size={22} color="#b197fc" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">가시거리</div>

              <span>{(data.rawList[0].visibility / 1000).toFixed(1)}km</span>
            </div>
          </div>

          {/* 추가 */}

          <div className="wd-metric-box">
            <Sunrise size={22} color="#ffd43b" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">일출</div>

              <span>{formatTime(data.sunrise)}</span>
            </div>
          </div>

          <div className="wd-metric-box">
            <Sunset size={22} color="#ff922b" className="wd-metric-icon" />

            <div className="wd-metric-content">
              <div className="wd-metric-title">일몰</div>

              <span>{formatTime(data.sunset)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 */}
      <div className="wd-right-panel">
        {/* 시간별 */}
        <div className="wd-hourly-section">
          <p className="wd-section-title">시간별 예보</p>

          <div className="wd-hourly-list">
            {hourlyForecast.map((hour: any, idx: number) => (
              <div key={idx} className="wd-hourly-item">
                <span className="wd-h-time">
                  {idx === 0
                    ? "지금"
                    : `${new Date(hour.dt * 1000).getHours()}시`}
                </span>

                <div className="wd-h-icon">
                  {renderWeatherIcon(hour.weather[0].icon, 24)}
                </div>

                <span className="wd-h-temp">{Math.round(hour.main.temp)}°</span>

                <span className="wd-h-pop">{Math.round(hour.pop * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 주간 */}
        <div className="wd-weekly-section">
          <p className="wd-section-title">주간 예보</p>

          <div className="wd-weekly-list">
            {weeklyData.map((day: any, idx: number) => {
              const target = day.pm || day.am;

              return (
                <div key={idx} className="wd-weekly-item">
                  <span className="wd-day">
                    {new Date(day.dt * 1000).toLocaleDateString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>

                  <div className="wd-weekly-icon">
                    {renderWeatherIcon(target?.weather?.[0]?.icon || "01d", 20)}
                  </div>

                  <span className="wd-week-desc">
                    {target?.weather?.[0]?.description || "-"}
                  </span>

                  <span className="wd-week-temp">
                    {day.am ? Math.round(day.am.main.temp) : "-"}° /
                    {day.pm ? Math.round(day.pm.main.temp) : "-"}°
                  </span>

                  <span className="wd-week-pop">
                    {target?.pop ? `${Math.round(target.pop * 100)}%` : "0%"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDetailView;
