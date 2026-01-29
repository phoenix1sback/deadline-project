const express = require("express");
const chrono = require("chrono-node");

/* =====================================
   INTENT TRAINING DATA
   ===================================== */

const INTENTS = {
  HIGH_URGENCY: [
    "late submissions will not be accepted",
    "no extensions allowed",
    "mandatory submission",
    "attendance is compulsory",
    "attendance is mandatory",
    "must be submitted"
  ],

  MEDIUM_URGENCY: [
    "important notice",
    "please submit",
    "kind reminder",
    "required submission"
  ],

  LOW_URGENCY: [
    "for your information",
    "optional",
    "if possible",
    "no hurry"
  ]
};

/* =====================================
   APP SETUP
   ===================================== */

const app = express();
app.use(express.json());
app.use(express.static("../frontend"));

/* =====================================
   BASIC UTILITIES
   ===================================== */

function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s:/.,-]/g, "")
    .trim();
}

function extractLinks(text) {
  return text.match(/https?:\/\/\S+/g) || [];
}

function isDeadlineMessage(text) {
  const keywords = [
    "deadline", "submit", "submission",
    "exam", "test", "assignment",
    "project", "mandatory", "due"
  ];
  return keywords.some(word => text.includes(word));
}

/* =====================================
   TOPIC DETECTION
   ===================================== */

function extractTopic(text) {
  if (/\bassignment\b/.test(text)) return "Assignment Submission";
  if (/\bproject\b/.test(text)) return "Project Deadline";
  if (/\bexam\b/.test(text)) return "Exam Schedule";
  if (/\btest\b/.test(text)) return "Test Schedule";
  if (/\bfee\b/.test(text)) return "Fee Payment";
  if (/\bform\b/.test(text)) return "Form Submission";
  return "General Deadline";
}

/* =====================================
   NLP / AI LOGIC
   ===================================== */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ");
}

function similarityScore(sentence, examples) {
  const sentenceWords = normalize(sentence);
  let maxScore = 0;

  for (let example of examples) {
    const exampleWords = normalize(example);
    const common = sentenceWords.filter(w => exampleWords.includes(w));
    const score = common.length / exampleWords.length;
    maxScore = Math.max(maxScore, score);
  }

  return maxScore;
}

function splitSentences(text) {
  return text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function detectSeriousness(rawText) {
  const sentences = splitSentences(rawText);
  let priority = "LOW";

  for (let sentence of sentences) {
    const highScore = similarityScore(sentence, INTENTS.HIGH_URGENCY);
    const mediumScore = similarityScore(sentence, INTENTS.MEDIUM_URGENCY);

    if (highScore >= 0.3) return "HIGH";
    if (mediumScore >= 0.3) priority = "MEDIUM";
  }

  return priority;
}

/* =====================================
   CONFIDENCE SCORE
   ===================================== */

function calculateConfidence(text, date, topic) {
  let score = 0;
  if (date) score += 40;
  if (topic !== "General Deadline") score += 30;
  if (isDeadlineMessage(text)) score += 30;
  return score;
}

/* =====================================
   API ENDPOINT
   ===================================== */

app.post("/api/extract", (req, res) => {
  const rawText = req.body.text || "";
  const cleanedText = cleanText(rawText);

  if (!isDeadlineMessage(cleanedText)) {
    return res.json({
      message: "No deadline-related content found",
      confidence: 10
    });
  }

  const date = chrono.parseDate(cleanedText);
  const topic = extractTopic(cleanedText);
  const seriousness = detectSeriousness(rawText);
  const confidence = calculateConfidence(cleanedText, date, topic);
  const links = extractLinks(rawText);

  res.json({
    topic,
    date,
    seriousness,
    confidence,
    importantLinks: links.length ? links : null
  });
});

/* =====================================
   START SERVER
   ===================================== */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
