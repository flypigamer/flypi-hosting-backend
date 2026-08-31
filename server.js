const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("🚀 Flypi Hosting Backend is Online!");
});

app.listen(PORT, () => {
  console.log(`Flypi Backend running on port ${PORT}`);
});
