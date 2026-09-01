const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AdmZip = require("adm-zip");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed."));
    }
  }
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
      message: "No ZIP file uploaded."
    });
  }

  try {
    const zip = new AdmZip(req.file.path);

    zip.extractAllTo("bots/" + Date.now(), true);

    res.json({
      success: true,
      message: "Bot ZIP uploaded and extracted successfully! 🚀",
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "ZIP extraction failed."
    });
  }
});

  app.listen(PORT, () => {
  console.log(`Flypi Backend running on port ${PORT}`);
});
