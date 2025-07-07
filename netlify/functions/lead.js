const sqlite3 = require("sqlite3").verbose();
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON" }),
    };
  }

  const dbPath = path.resolve(__dirname, "../../newsletter.db");
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve) => {
    const stmt = db.prepare(`
      INSERT INTO leads (name, email, phone, company, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.name,
      data.email,
      data.phone,
      data.company,
      data.message,
      (err) => {
        if (err) {
          console.error("DB Insert Error:", err);
          db.close();
          return resolve({
            statusCode: 500,
            body: JSON.stringify({
              message: "Error saving your details. Please try again.",
              error: err.message,
            }),
          });
        }

        db.close();
        return resolve({
          statusCode: 200,
          body: JSON.stringify({
            message: "We will get back to you soon :)",
          }),
        });
      }
    );
  });
};
