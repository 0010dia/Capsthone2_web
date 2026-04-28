import React, { useState, useEffect } from "react";
import "../styles/DetailView.css";
import WeatherDetailView from "./WeatherDetailView.tsx";
import NewsDetailView from "./NewsDetailView.tsx";

const DetailView: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"news" | "weather">("news");
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const handleWeatherUpdate = (e: any) => {
      setWeatherData(e.detail);
    };
    window.addEventListener("weatherUpdate", handleWeatherUpdate);
    return () =>
      window.removeEventListener("weatherUpdate", handleWeatherUpdate);
  }, []);

  return (
    <div className="detail-view-wrapper">
      <button className="open-button" onClick={() => setIsOpen(true)}>
        자세히보기
      </button>

      {isOpen && (
        <div className="view-overlay" onClick={() => setIsOpen(false)}>
          <div className="view-content" onClick={(e) => e.stopPropagation()}>
            <div className="view-header">
              <div className="header-left-group">
                {activeTab === "weather" && weatherData && (
                  <span className="header-location">
                    📍 {weatherData.location} 주간 및 시간별 상세 날씨
                  </span>
                )}
              </div>

              <div className="header-right-group">
                <div className="tab-menu">
                  <button
                    className={`tab-item ${activeTab === "news" ? "active" : ""}`}
                    onClick={() => setActiveTab("news")}
                  >
                    뉴스
                  </button>
                  <button
                    className={`tab-item ${activeTab === "weather" ? "active" : ""}`}
                    onClick={() => setActiveTab("weather")}
                  >
                    날씨
                  </button>
                   <button
                  className="close-x-button"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
                </div>
              
              </div>
            </div>

            <div className="view-body">
              {activeTab === "weather" ? (
                <WeatherDetailView data={weatherData} />
              ) : (
                <NewsDetailView />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailView;
