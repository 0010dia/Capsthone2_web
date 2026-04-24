import React, { useState, useEffect } from "react";
import "./App.css";

import Weather from "./components/WeatherWidget";
import News from "./components/NewsWidget";
import Music from "./components/MusicWidget";
import Stock from "./components/StockWidget";

import DetailView from "./components/DetailView"; 

type ModuleType = "news" | "music" | "weather" | "stock";

interface User {
  name: string;
  preferences: ModuleType[];
}

const MODULE_MAP: Record<ModuleType, React.ReactNode> = {
  weather: <Weather />,
  news: <News />,
  music: <Music />,
  stock: <Stock />,
};

export default function SmartMirrorApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setCurrentUser({
        name: "나영준",
        preferences: ["news", "music", "weather", "stock"],
      });
    }, 1500);
  }, []);

  if (!currentUser) return <div className="loading-screen"><h1>SCANNING...</h1></div>;

  const { preferences, name } = currentUser;

  return (
    <div className="mirror-container dashboard-layout">
      <div className="slot top-left">{MODULE_MAP[preferences[0]]}</div>
      <div className="slot bottom-left">{MODULE_MAP[preferences[1]]}</div>
      
      {/*자세히보기 창*/}
      <div className="reflection-zone">
        <DetailView />
      </div>

      <div className="slot top-right">{MODULE_MAP[preferences[2]]}</div>
      <div className="slot bottom-right">{MODULE_MAP[preferences[3]]}</div>

      <div className="footer-greeting">
        <h2>반갑습니다, {name}님.</h2>
      </div>
    </div>
  );
}