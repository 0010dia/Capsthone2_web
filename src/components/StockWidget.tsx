import React, { useState, useEffect } from "react";
import "../styles/StockWidget.css";

// 종목 데이터 타입 정의
interface StockData {
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

const StockWidget: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  // 보여주고 싶은 종목 리스트 (이름과 야후 심볼)
  const stockList = [
    { name: "현대자동차", symbol: "005380.KS" },
    { name: "삼성전자", symbol: "005930.KS" },
    { name: "애플", symbol: "AAPL" },
  ];

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const results = await Promise.all(
          stockList.map(async (item) => {
            const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

            const res = await fetch(proxyUrl);
            const data = await res.json();
            const meta = data.chart.result[0].meta;

            const currentPrice = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const changePercent =
              ((currentPrice - previousClose) / previousClose) * 100;
            const isUp = currentPrice >= previousClose;

            return {
              name: item.name,
              // 미국 주식(TSLA)이면 $, 한국 주식(.KS)이면 원으로 표시
              price: item.symbol.includes(".KS")
                ? `${currentPrice.toLocaleString()}원`
                : `$${currentPrice.toLocaleString()}`,
              change: `${Math.abs(changePercent).toFixed(2)}%`,
              isUp: isUp,
            };
          }),
        );
        setStocks(results);
      } catch (error) {
        console.error("주식 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
    const interval = setInterval(fetchAllStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget stock-widget">
      <div className="widget-header">
        <span className="header-icon">📈</span>
        <h3>관심 종목</h3>
      </div>

      {loading ? (
        <p className="loading-text">데이터를 불러오는 중...</p>
      ) : (
        <div className="stock-list">
          {stocks.map((stock, index) => (
            <div key={index} className="stock-item">
              <span className="stock-name">{stock.name}</span>
              <div className="stock-data">
                <span className="stock-price">{stock.price}</span>
                <span className={`stock-change ${stock.isUp ? "up" : "down"}`}>
                  {stock.isUp ? "▲" : "▼"} {stock.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockWidget;
