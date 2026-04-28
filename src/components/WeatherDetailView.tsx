import React from "react";
import "../styles/WeatherDetailView.css";

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

      if (!days[dateKey]) days[dateKey] = { am: null, pm: null, dt: item.dt };
      if (hour >= 8 && hour <= 11) days[dateKey].am = item;
      if (hour >= 14 && hour <= 17) days[dateKey].pm = item;
    });
    return Object.values(days).slice(1, 6);
  };

  const weeklyData: any[] = getWeeklyData();

  return (
    <div className="weather-detail-container">
      {/* [상단]] 주간 예보 */}
      <div className="weekly-forecast-line-section">
        <div className="weekly-list">
          {weeklyData.map((day: any, idx: number) => (
            <div key={idx} className="weekly-item compact-mode">
              <span className="day">
                {new Date(day.dt * 1000).toLocaleDateString("ko-KR", {
                  weekday: "short",
                })}
              </span>
              <img
                src={`https://openweathermap.org/img/wn/${(day.pm || day.am || {}).weather?.[0].icon || "01d"}.png`}
                alt="w-icon"
                className="weekly-icon"
              />
              <div className="temp-range stacked">
                <span className="am-temp">
                  {day.am ? Math.round(day.am.main.temp) : "-"}°
                </span>
                <span className="divider-horizontal">/</span>
                <span className="pm-temp">
                  {day.pm ? Math.round(day.pm.main.temp) : "-"}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* [중간] 시간대별 예보 */}
      <div className="hourly-forecast-line-section">
        <p className="section-date-label">
          {new Date().toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="hourly-scroll-list">
          {hourlyForecast.map((hour: any, idx: number) => (
            <div key={idx} className="hourly-item">
              <span className="h-time">
                {idx === 0
                  ? "지금"
                  : `${new Date(hour.dt * 1000).getHours()}시`}
              </span>
              <img
                src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                alt="h-icon"
                className="h-icon"
              />
              <span className="h-temp">{Math.round(hour.main.temp)}°</span>

              <span className="h-pop">
                {hour.pop > 0 ? `${Math.round(hour.pop * 100)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* [하단] 상세 수치 */}
      <div className="detail-metrics-grid-flat">
        <div className="metric-box-flat">💧 습도: {data.humidity}%</div>
        <div className="metric-box-flat">🌬️ 풍속: {data.wind_speed}m/s</div>
        <div className="metric-box-flat">🌡️ 체감: {data.feels_like}°</div>
        <div className="metric-box-flat">
          ☁️ 구름: {data.rawList[0].clouds.all}%
        </div>
        <div className="metric-box-flat">
          ⏲️ 기압: {data.rawList[0].main.pressure}hPa
        </div>
        <div className="metric-box-flat">
          👁️ 가시: {(data.rawList[0].visibility / 1000).toFixed(1)}km
        </div>
      </div>
    </div>
  );
};

export default WeatherDetailView;
