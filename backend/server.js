const express = require("express");
const chrono = require("chrono-node");

const app = express();
app.use(express.json());
app.use(express.static("../frontend"));

/* ---------------- HELPER FUNCTIONS ---------------- */

// Clean text but KEEP links
function cleanText(text) {
  return text
    .replace(/[^\w\s:/.,-]/g, "")
    .replace(/\b(hi|hello|dear|thanks|regards|good morning)\b/gi, "")
    .trim();
}

// Extract links
function extractLinks(text) {
  const links = text.match(/https?:\/\/\S+/g);
  return links || [];
}

// Check if deadline-related
function isDeadlineMessage(text) {
  const keywords = [
    "deadline", "due", "submission", "submit",
    "exam", "test", "assignment", "project",
    "last date", "fees", "payment", "mandatory", "fill"
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
}

// Extract topic using context
function extractTopic(text) {
  const keywords = [
    "assignment", "project", "exam",
    "test", "submission", "fee",
    "presentation", "review", "form"
  ];

  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    for (let k of keywords) {
      if (words[i].toLowerCase().includes(k)) {
        return words.slice(Math.max(0, i - 2), i + 3).join(" ");
      }
    }
  }
  return "General Deadline";
}

// Detect seriousness
function detectSeriousness(text) {
  let score = 0;
  const high = ["mandatory", "not accepted", "strict", "must", "last date"];
  const medium = ["important", "reminder", "required", "due"];

  high.forEach(w => { if (text.toLowerCase().includes(w)) score += 3; });
  medium.forEach(w => { if (text.toLowerCase().includes(w)) score += 2; });

  if (score >= 3) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

// Confidence score
function calculateConfidence(text, date, topic) {
  let confidence = 0;
  if (date) confidence += 40;
  if (topic !== "General Deadline") confidence += 30;
  if (isDeadlineMessage(text)) confidence += 30;
  return confidence;
}

/* ---------------- API ROUTE ---------------- */

app.post("/api/extract", (req, res) => {
  const rawText = req.body.text;

  const links = extractLinks(rawText);
  const text = cleanText(rawText);

  // If not a deadline message
  if (!isDeadlineMessage(text)) {
    return res.json({
      message: "No deadline-related content found.",
      confidence: 10
    });
  }

  const date = chrono.parseDate(text);
  const topic = extractTopic(text);
  const seriousness = detectSeriousness(text);
  const confidence = calculateConfidence(text, date, topic);

  res.json({
    topic,
    date,
    seriousness,
    confidence,
    importantLinks: links.length > 0 ? links : null
  });
});

/* ---------------- START SERVER ---------------- */

app.listen(3000, () =>
  console.log("Server running on port 3000")
);
