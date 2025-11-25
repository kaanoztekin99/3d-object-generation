import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Statik frontend dosyaları sun (index.html vs)
app.use(express.static("./"));

const CSV_PATH = path.join(process.cwd(), "survey_results.csv");

// CSV yoksa header ile oluştur
function ensureCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(
      CSV_PATH,
      "Name,Gender,Age,Experience3D,Question,Model,Rating\n",
      "utf8"
    );
  }
}

// POST /save
app.post("/save", (req, res) => {
  try {
    ensureCSV();

    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "rows array missing" });
    }

    // Her satırı CSV’ye append et
    const text = rows.map(r => r.join(",")).join("\n") + "\n";
    fs.appendFileSync(CSV_PATH, text, "utf8");

    res.json({ status: "ok" });

  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save CSV" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});