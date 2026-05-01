const express = require("express");
const cors = require("cors");

const newsRouter = require("./routes/news");

const app = express();
app.use(cors());

app.use("/news", newsRouter);

app.listen(3001, () => {
  console.log("🚀 server running: http://localhost:3001");
});