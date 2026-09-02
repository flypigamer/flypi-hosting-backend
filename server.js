const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

if (!fs.existsSync("bots")) {
  fs.mkdirSync("bots", { recursive: true });
}

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

app.post("/upload", upload.single("botFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No ZIP file uploaded."
    });
  }

  if (!req.body.botName) {
    return res.status(400).json({
      success: false,
      message: "Bot name is required."
    });
  }

  try {
    const botId = Date.now().toString();
    const botFolder = "bots/" + botId;

    fs.mkdirSync(botFolder, { recursive: true });

    const zip = new AdmZip(req.file.path);

    zip.extractAllTo(botFolder, true);

    fs.writeFileSync(
      botFolder + "/bot-info.json",
      JSON.stringify(
        {
          id: botId,
          name: req.body.botName,
          fileName: req.file.originalname,
          status: "Offline"
        },
        null,
        2
      )
    );

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: "Bot uploaded successfully! 🚀",
      bot: {
        id: botId,
        name: req.body.botName,
        fileName: req.file.originalname,
        status: "Offline"
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "ZIP extraction failed."
    });
  }
});

app.get("/bots", (req, res) => {
  const folders = fs.readdirSync("bots");

  const bots = folders.map((folder) => {
    const infoPath = "bots/" + folder + "/bot-info.json";

    if (fs.existsSync(infoPath)) {
      return JSON.parse(fs.readFileSync(infoPath, "utf8"));
    }

    return {
      id: folder,
      name: folder,
      fileName: "Unknown",
      status: "Offline"
    };
  });

  res.json({
    success: true,
    bots: bots
  });
});

app.post("/start", (req, res) => {
  const botId = req.body.botId;

  if (!botId) {
    return res.status(400).json({
      success: false,
      message: "Bot ID is required."
    });
  }

  const infoPath = "bots/" + botId + "/bot-info.json";

  if (!fs.existsSync(infoPath)) {
    return res.status(404).json({
      success: false,
      message: "Bot not found."
    });
  }

  const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));

  info.status = "Running";

  fs.writeFileSync(
    infoPath,
    JSON.stringify(info, null, 2)
  );

  res.json({
    success: true,
    message: info.name + " is now marked as Running! ▶️"
  });
});

app.post("/stop", (req, res) => {
  const botId = req.body.botId;

  if (!botId) {
    return res.status(400).json({
      success: false,
      message: "Bot ID is required."
    });
  }

  const infoPath = "bots/" + botId + "/bot-info.json";

  if (!fs.existsSync(infoPath)) {
    return res.status(404).json({
      success: false,
      message: "Bot not found."
    });
  }

  const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));

  info.status = "Offline";

  fs.writeFileSync(
    infoPath,
    JSON.stringify(info, null, 2)
  );

  res.json({
    success: true,
    message: info.name + " has been stopped. ⏹️"
  });
});

pool.query(`
  CREATE TABLE IF NOT EXISTS bots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Offline'
  )
`)
.then(() => {
  console.log("✅ Database table ready");
})
.catch((error) => {
  console.error("❌ Database error:", error);
});

app.listen(PORT, () => {
  console.log(`🚀 Flypi Backend running on port ${PORT}`);
});
