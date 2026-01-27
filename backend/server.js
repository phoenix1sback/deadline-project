const express = require("express");
const chrono = require("chrono-node");
const nlp = require("compromise");

const app = express();
app.use(express.json());
app.use(express.static("../frontend"));

app.post("/api/extract", (req, res) => {
  const text = req.body.text;

  // Date extraction
  const date = chrono.parseDate(text);

  // Topic extraction
  let topic = "Unknown";
  if (text.toLowerCase().includes("assignment")) topic = "Assignment";
  if (text.toLowerCase().includes("exam")) topic = "Exam";
  if (text.toLowerCase().includes("project")) topic = "Project";

  // Seriousness detection
  let seriousness = "LOW";
  if (text.match(/must|mandatory|not accepted|strict/i))
    seriousness = "HIGH";

  res.json({
    topic,
    date,
    seriousness
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
