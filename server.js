require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const rateLimit = require("express-rate-limit");
const sanitizeHtml = require("sanitize-html");
const helmet = require("helmet");

const app = express();
const port = 3000;

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiter - 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later."
});
app.use(limiter);

// Connect to SQLite database
let db = new sqlite3.Database("./newsletter.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create tables if not exist
db.run(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS faq_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL,
    question TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper to validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Helper to convert UTC datetime string to IST
function convertToIST(utcDateStr) {
  const utcDate = new Date(utcDateStr + "Z"); // ensure it's parsed as UTC
  // add 5 hours 30 minutes
  utcDate.setMinutes(utcDate.getMinutes() + 330);
  return utcDate.toISOString().replace("T", " ").substring(0, 19);
}

// ======= Routes ======= //

// Newsletter Subscribe
app.post("/subscribe", (req, res) => {
  const email = req.body.email;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: "Valid email is required." });
  }

  db.run(
    `INSERT INTO subscribers(email) VALUES(?)`,
    [email],
    function (err) {
      if (err) {
        console.error("Database error.");
        return res.status(500).json({ message: "Internal server error." });
      }
      // Fetch the inserted row for timestamp
      db.get(
        `SELECT * FROM subscribers WHERE id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error("Database error.");
            return res.status(500).json({ message: "Internal server error." });
          }
          const createdAtIST = convertToIST(row.created_at);
          res.json({
            message: "Subscription successful!",
            created_at_ist: createdAtIST
          });
        }
      );
    }
  );
});

// Lead Generation
app.post("/lead", (req, res) => {
  const name = sanitizeHtml(req.body.name || "");
  const email = req.body.email;
  const phone = req.body.phone;
  const company = sanitizeHtml(req.body.company || "");
  const message = sanitizeHtml(req.body.message || "");

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: "Valid email is required." });
  }

  if (!name && !message) {
    return res
      .status(400)
      .json({ message: "Name or message is required." });
  }

  if (phone && !/^\d{7,15}$/.test(phone)) {
    return res.status(400).json({
      message: "Phone must be digits only (7 to 15 digits)."
    });
  }

  db.run(
    `INSERT INTO leads(name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, company, message],
    function (err) {
      if (err) {
        console.error("Database error.");
        return res.status(500).json({ message: "Internal server error." });
      }
      db.get(
        `SELECT * FROM leads WHERE id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error("Database error.");
            return res.status(500).json({ message: "Internal server error." });
          }
          const createdAtIST = convertToIST(row.created_at);
          res.json({
            message: "We will get back to you soon :)",
            created_at_ist: createdAtIST
          });
        }
      );
    }
  );
});

// FAQ Inquiry
app.post("/faq", (req, res) => {
  const name = sanitizeHtml(req.body.name || "");
  const email = req.body.email;
  const question = sanitizeHtml(req.body.question || "");

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: "Valid email is required." });
  }

  if (!question || question.trim().length < 5) {
    return res
      .status(400)
      .json({ message: "Please enter a meaningful question." });
  }

  db.run(
    `INSERT INTO faq_inquiries(name, email, question) VALUES (?, ?, ?)`,
    [name, email, question],
    function (err) {
      if (err) {
        console.error("Database error.");
        return res.status(500).json({ message: "Internal server error." });
      }
      db.get(
        `SELECT * FROM faq_inquiries WHERE id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error("Database error.");
            return res.status(500).json({ message: "Internal server error." });
          }
          const createdAtIST = convertToIST(row.created_at);
          res.json({
            message: "FAQ question submitted!",
            created_at_ist: createdAtIST
          });
        }
      );
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
