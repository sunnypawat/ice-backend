import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt from "bcrypt";
import { getTopLosersAndWinners } from "./controller/marketController.js";
import { fetchAllData } from "./controller/dataFetcher.js"; // import the function

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
    res.status(200).json({ topWinners, topLosers });
  } catch (error) {
    console.error("Error in /api/nasdaq:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new route to trigger data fetching
app.get("/api/fetch-nasdaq-data", async (req, res) => {
  try {
    await fetchAllData();
    res.status(200).json({ message: "NASDAQ data fetched successfully" });
  } catch (error) {
    console.error("Error fetching NASDAQ data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route to retrieve news
app.get("/api/news", (req, res) => {
  connection.query(
    "SELECT * FROM NewsPage ORDER BY Date DESC",
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error", details: err });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// POST route to create news
app.post("/api/news", (req, res) => {
  const { title, subtitle, description, date, author, picture } = req.body;
  // Construct the INSERT statement with proper escaping
  const query =
    "INSERT INTO NewsPage (Title, Subtitle, Description, Date, Author, Picture) VALUES (?, ?, ?, ?, ?, ?)";

  // Use array to avoid SQL injection
  const values = [title, subtitle, description, date, author, picture];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error", details: err });
    } else {
      res.status(201).json({
        message: "News added successfully",
        insertId: results.insertId,
      });
    }
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
