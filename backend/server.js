const express = require("express");
const chrono = require("chrono-node");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const INTENTS = {
  HIGH: [
    "late submissions will not be accepted",
    "no extensions allowed",
    "mandatory",
    "must be submitted",
    "attendance is compulsory"
  ],
  MEDIUM: [
    "important notice",
    "please submit",
    "kind reminder"
  ]
};

function cleanText(text) {
  return text.toLowerCase().replace(/[^\w\s:/.,-]/g, "");
}

function extractTopic(text) {
  if (text.includes("assignment")) return "Assignment Submission";
  if (text.includes("project")) return "Project Deadline";
  if (text.includes("exam")) return "Exam Schedule";
  if (text.includes("test")) return "Test Schedule";
  if (text.includes("form")) return "Form Submission";
  return "General Deadline";
}

function similarity(sentence, examples) {
  const s = sentence.split(" ");
  let best = 0;

  for (let e of examples) {
    const ew = e.split(" ");
    const common = s.filter(w => ew.includes(w));
    best = Math.max(best, common.length / ew.length);
  }
  return best;
}

function detectSeriousness(text) {
  const sentences = text.split(/[.!?]/);
  let level = "LOW";

  for (let s of sentences) {
    if (similarity(s, INTENTS.HIGH) >= 0.3) return "HIGH";
    if (similarity(s, INTENTS.MEDIUM) >= 0.3) level = "MEDIUM";
  }
  return level;
}

app.post("/api/extract", (req, res) => {
  const raw = req.body.text || "";
  const text = cleanText(raw);

  const date = chrono.parseDate(text);
  const topic = extractTopic(text);
  const seriousness = detectSeriousness(text);

  res.json({
    topic,
    date,
    seriousness
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

