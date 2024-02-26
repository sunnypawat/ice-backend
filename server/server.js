/*
// server.js
import express from "express";
import bodyParser from "body-parser";
import articleController from "./controller/articleController.js";
import userController from "./controller/userController.js";
import authController from "./controller/authController.js";

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

// Create Article
app.post("/api/articles", (req, res) => {
  const { title, content, imageLink } = req.body;
  articleController.createArticle(title, content, imageLink);
  res.status(201).json({ message: "Article created successfully" });
});

// Get Articles
app.get("/api/articles", (req, res) => {
  articleController.getArticles((articles) => {
    res.status(200).json(articles);
  });
});

// Create User
app.post("/api/users", (req, res) => {
  const { username, password } = req.body;
  userController.createUser(username, password);
  res.status(201).json({ message: "User created successfully" });
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  authController.login(username, password, (result) => {
    res.status(result.error ? 401 : 200).json(result);
  });
});

// Home route
app.get("/api/home", (req, res) => {
  res.json({ message: "hello world!" });
});

app.listen(PORT, () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  console.log(`Server start on port ${PORT} at ${dateTime}`);
});
*/

import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt from "bcrypt";
import { getTopLosersAndWinners } from "./controller/marketController.js";

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "projectICE_db",
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Create Article
app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, imageLink } = req.body;

    const query =
      "INSERT INTO Article (title, content, imageLink) VALUES (?, ?, ?)";

    connection.query(query, [title, content, imageLink], (error, results) => {
      if (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(201).json({ message: "Article created successfully" });
      }
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Articles
app.get("/api/articles", async (req, res) => {
  try {
    const query = "SELECT * FROM Article";

    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error getting articles:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Error getting articles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create User
app.post("/api/users", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO `User` (username, password) VALUES (?, ?)";
    connection.query(query, [username, hashedPassword], (error, results) => {
      if (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(201).json({ message: "User created successfully" });
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = "SELECT * FROM `User` WHERE username = ?";
    connection.query(query, [username], async (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      // Check if the user exists
      if (results.length === 0) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(
        password,
        results[0].password
      );

      if (isPasswordValid) {
        res.status(200).json({ message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid username or password" });
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Market API
// Get top losers and winners for NASDAQ 100
app.get("/api/nasdaq", async (req, res) => {
  try {
    const { topLosers, topWinners } = await getTopLosersAndWinners();
    res.status(200).json({ topLosers, topWinners });
  } catch (error) {
    console.error("Error in /api/nasdaq:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Home route
app.get("/api/home", (req, res) => {
  res.json({ message: "hello world!" });
});

app.listen(PORT, () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  console.log(`Server start on port ${PORT} at ${dateTime}`);
});
