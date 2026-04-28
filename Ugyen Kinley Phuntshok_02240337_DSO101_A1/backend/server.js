require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Initialize DB table
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err.message);
  }
}

initDB();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET all todos
app.get("/api/todos", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// GET single todo
app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// POST create todo
app.post("/api/todos", async (req, res) => {
  try {
    const { title, description, priority = "medium" } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO todos (title, description, priority)
       VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), description || null, priority]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT update todo
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }
    const { rows } = await pool.query(
      `UPDATE todos
       SET title = $1, description = $2, completed = $3, priority = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [title.trim(), description || null, completed ?? false, priority || "medium", id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// PATCH toggle complete
app.patch("/api/todos/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE todos SET completed = NOT completed, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});

// DELETE todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted successfully", todo: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
