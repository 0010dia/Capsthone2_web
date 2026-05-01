import React, { useState, useEffect } from "react";
import "../styles/NewsDetailView.css";

interface NewsProps {
  onTitleChange: (title: string) => void;
}

const NewsDetailView: React.FC<NewsProps> = ({ onTitleChange }) => {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:3001/news");
        const data = await res.json();

        if (data && data.length > 0) {
          setNewsList(data);
        }
      } catch (e) {
        console.error("뉴스 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    setSelectedNews(null);
  }, []);

  const handleSelectNews = (news: any) => {
    setSelectedNews(news);
    onTitleChange(news.title);
  };

  if (loading)
    return <div className="loading-text">뉴스를 불러오는 중...</div>;

  return (
    <div className="news-container">

      {/* 뉴스 선택 버튼 */}
      <div className="news-selector">
        {newsList.slice(0, 3).map((news, index) => (
          <button
            key={index}
            className={`news-select-btn ${
              selectedNews?.title === news.title ? "active" : ""
            }`}
            onClick={() => handleSelectNews(news)}
          >
            {index + 1}번 뉴스 보기
          </button>
        ))}
      </div>

      {selectedNews && (
        <div className="news-article">

          {selectedNews.image && (
            <img
              src={selectedNews.image}
              className="news-main-image"
              alt="news"
            />
          )}

          <div className="news-body-content">
            {selectedNews.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetailView;