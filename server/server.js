const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const RSS_URL = "https://www.yna.co.kr/rss/news.xml";

app.get("/news", async (req, res) => {
  try {
    const { data } = await axios.get(RSS_URL);

    const $ = cheerio.load(data, { xmlMode: true });

    const items = [];

    $("item").each((i, el) => {
      if (i >= 3) return false;

      const title = $(el).find("title").text();
      const link = $(el).find("link").text();

      items.push({ title, url: link });
    });

    const results = await Promise.all(
      items.map(async (item) => {
        const { data: detailHtml } = await axios.get(item.url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $$ = cheerio.load(detailHtml);

        const article = $$("#articleWrap").clone();
        article.find("figcaption").remove();
        let rawText = article.text().trim();

        const match = rawText.match(/(기자|특파원)\s*=\s*/);
        if (match) {
          rawText = rawText.slice(match.index + match[0].length);
        }

        let cleanContent = rawText

          .split("관련 뉴스")[0]
          .split("제보는")[0]
          // 1. 괄호형 설명 제거 (사진, 위치 등)
          .replace(/\([^)]*연합뉴스[^)]*\)/g, "")
          .replace(/\([^)]*사진[^)]*\)/g, "")
          .replace(/카카오톡/g, "")
          .replace(/이미지 확대/g, "")

          // 2️. [자료사진] 제거
          .replace(/\[[^\]]*\]/g, "")

          // 3️. 이메일 제거
          .replace(/\S+@\S+\.\S+/g, "")

          // 4️. 꼬리 문구 제거
          .replace(/무단 전재 및 재배포 금지.*$/g, "")
          .replace(/\(끝\).*$/g, "")

          // 5️. 제보 문구 제거
          .replace(/▶.*$/g, "")

          // 6️. 공백 정리
          .replace(/\s+/g, " ")

          // 7️. 문장 기준 줄바꿈
          .replace(/([.?!])\s*(?=[가-힣A-Z])/g, "$1\n\n")

          .trim();

        const image = $$('meta[property="og:image"]').attr("content") || null;

        return {
          title: item.title,
          content: cleanContent || "본문을 불러올 수 없습니다.",
          image,
          url: item.url,
        };
      }),
    );

    res.json(results);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

app.listen(3001, () => {
  console.log("🚀서버 실행 중 http://localhost:3001");
});
