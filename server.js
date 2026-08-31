const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🚀 Flypi Hosting Backend is Online!");
});

app.listen(PORT, () => {
  console.log(`Flypi Backend running on port ${PORT}`);
});
