// =====================================
// ClockWidget.tsx
// =====================================

import React, { useEffect, useState } from "react";

import "../styles/ClockWidget.css";

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // 시간
  // =========================

  const formattedTime = time.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // =========================
  // 날짜
  // =========================

  const formattedDate = time.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="clock-widget">
      <div className="clock-time">{formattedTime}</div>

      <div className="clock-date">{formattedDate}</div>
    </div>
  );
};

export default ClockWidget;
