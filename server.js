const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const upload = multer({
  dest: "uploads/"
});

app.get("/", (req, res) => {
  res.send("🚀 Flypi Hosting Backend is Online!");
});
app.post("/start", (req, res) => {
  res.json({
    success: true,
    message: "Bot start command received! ▶️"
  });
});

app.post("/stop", (req, res) => {
  res.json({
    success: true,
    message: "Bot stop command received! ⏹️"
  });
});

app.post("/upload", upload.single("botFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded."
    });
  }

  res.json({
    success: true,
    message: "Bot file uploaded successfully! 🚀",
    fileName: req.file.originalname
  });
});

app.listen(PORT, () => {
  console.log(`Flypi Backend running on port ${PORT}`);
});
