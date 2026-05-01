const newsService = require("../services/newsService");

exports.getNews = async (req, res) => {
  try {
    const data = await newsService.fetchNews();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
};