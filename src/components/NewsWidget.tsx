import React, { useState, useEffect } from "react";

import { Newspaper } from "lucide-react";

import "../styles/NewsWidget.css";

const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<{ title: string; link: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:3001/news");
        const data = await res.json();

        setNews(
          data.slice(0, 3).map((item: any) => ({
            title: item.title,
            link: item.url,
          })),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget news-widget">
      <div className="widget-header">
        <Newspaper size={20} strokeWidth={2} /> <h3>오늘의 주요 뉴스</h3>
      </div>

      {loading ? (
        <p className="loading-text">뉴스를 불러오는 중...</p>
      ) : (
        <ul className="news-list">
          {news.map((item, index) => (
            <li key={index} className="news-item">
              <a href={item.link} target="_blank" rel="noreferrer">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsWidget;
