import React, { useState, useEffect } from "react";
import "../styles/NewsWidget.css";

const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<{ title: string; link: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const rssUrl =
          "https://news.google.com/rss/headlines?hl=ko&gl=KR&ceid=KR:ko";
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("프록시 서버 응답 에러");

        const textData = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "text/xml");

        const items = xmlDoc.querySelectorAll("item");
        const topNews = Array.from(items)
          .slice(0, 3)
          .map((item) => {
            const description =
              item.querySelector("description")?.textContent || "";
            const descDoc = parser.parseFromString(description, "text/html");
            const headlineInDesc = descDoc.querySelector("a")?.textContent;

            let finalTitle =
              headlineInDesc ||
              item.querySelector("title")?.textContent ||
              "제목 없음";

            const parts = finalTitle.split(" - ");
            if (parts.length > 1) {
              finalTitle = parts.slice(0, -1).join(" - ");
            }

            return {
              title: finalTitle.trim(),
              link: item.querySelector("link")?.textContent || "#",
            };
          });

        setNews(topNews);
      } catch (error) {
        console.error("뉴스 로드 실패:", error);
        setNews([
          { title: "뉴스 데이터를 불러올 수 없습니다.", link: "#" },
          { title: "네트워크 연결 상태를 확인해주세요.", link: "#" },
          { title: "잠시 후 자동으로 다시 시도합니다.", link: "#" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  
  return (
    <div className="widget news-widget">
      <div className="widget-header">
        <span style={{ fontSize: "20px" }}>📰</span>
        <h3>오늘의 주요 뉴스</h3>
      </div>

      {loading ? (
        <p className="loading-text">뉴스를 불러오는 중...</p>
      ) : (
        <ul className="news-list">
          {news.map((item, index) => (
            <li key={index} className="news-item">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="news-title"
              >
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
