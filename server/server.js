import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";
import {
  getTopLosersAndWinners,
  getTopVolumeStocks,
  getTopVolumeTraded,
} from "./controller/marketController.js";
import { fetchAllData } from "./controller/dataFetcher.js";
import cors from 'cors';


const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

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

// Add Course
app.post("/api/courses", async (req, res) => {
  try {
    const { title, description, picture } = req.body;

    const query =
      "INSERT INTO Courses (title, description, picture) VALUES (?, ?, ?)";

    connection.query(query, [title, description, picture], (error, results) => {
      if (error) {
        console.error("Error adding course:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(201).json({
          message: "Course added successfully",
          courseId: results.insertId,
        });
      }
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Courses
app.get("/api/courses", async (req, res) => {
  try {
    const query = "SELECT * FROM Courses";

    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Server error while getting courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get One Course
app.get("/api/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const query = `
        SELECT Courses.title as courseTitle, Courses.description as courseDescription, Courses.picture as coursePicture,
               Modules.subdivision_title as moduleTitle, Modules
               .subdivision_description as moduleDescription
        FROM Courses
        LEFT JOIN Modules ON Courses.id = Modules.course_id
        WHERE Courses.id = ?`;

    connection.query(query, [courseId], (error, results) => {
      if (error) {
        console.error("Error fetching course details:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: "Course not found" });
        } else {
          const courseDetails = {
            courseTitle: results[0].courseTitle,
            courseDescription: results[0].courseDescription,
            coursePicture: results[0].coursePicture,
            modules: results
              .filter((result) => result.moduleTitle !== null)
              .map((result) => ({
                moduleTitle: result.moduleTitle,
                moduleDescription: result.moduleDescription,
              })),
          };

          res.status(200).json(courseDetails);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Module (Subdivision)
app.post("/api/module", async (req, res) => {
  try {
    const { courseId, subdivisionTitle, subdivisionDescription } = req.body;

    const query =
      "INSERT INTO Modules (course_id, subdivision_title, subdivision_description) VALUES (?, ?, ?)";

    connection.query(
      query,
      [courseId, subdivisionTitle, subdivisionDescription],
      (error, results) => {
        if (error) {
          console.error("Error adding subcourse:", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.status(201).json({
            message: "Subcourse added successfully",
            subcourseId: results.insertId,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error adding subcourse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Content
app.post("/api/contents", async (req, res) => {
  try {
    const { moduleId, contentTitle, contentDescription, body, video } =
      req.body;

    const query =
      "INSERT INTO Content (module_id, content_title, content_description, body, video) VALUES (?, ?, ?, ?, ?)";

    connection.query(
      query,
      [moduleId, contentTitle, contentDescription, body, video],
      (error, results) => {
        if (error) {
          console.error("Error adding content:", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.status(201).json({
            message: "Content added successfully",
            contentId: results.insertId,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error adding content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Content for a Specific Module
app.get("/api/modules/:moduleId", async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    const query = `
      SELECT
        ct.id as contentId,
        ct.content_title as contentTitle,
        ct.content_description as contentDescription,
        ct.body as contentBody,
        ct.video as contentVideo,
        ct.created_at as contentCreatedAt,
        ct.updated_at as contentUpdatedAt
      FROM Content ct
      WHERE ct.module_id = ?`;

    connection.query(query, [moduleId], (error, results) => {
      if (error) {
        console.error("Error fetching content for module:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: "No content found for this module" });
        } else {
          res.status(200).json({ contents: results });
        }
      }
    });
  } catch (error) {
    console.error("Server error while getting contents for a module:", error);
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

// Setting up cookie-parser
app.use(cookieParser());

// Setting up express-session
app.use(
  session({
    secret: "LAJBKJF213HOUF8FDIA79STDV12KASF", // This should be a long, random string to keep sessions secure
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // This helps prevent client-side script from accessing the data
      secure: process.env.NODE_ENV === "production", // Set secure to true if using https
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);

// Login endpoint
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
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Upon login, establish a session
        req.session.userId = user.id; // Assign the user's ID to the session
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

// Make sure to add a logout endpoint to destroy the session
app.post("/api/logout", function (req, res) {
  req.session.destroy(function (error) {
    if (error) {
      res.status(500).json({ error: "Could not log out, please try again" });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  });
});

app.get("/api/test/user", (req, res) => {
  // Check if the session exists and has user info
  if (req.session && req.session.userId) {
    const userId = req.session.userId;

    // Look up the user in the database to get their username
    const query = "SELECT id, username FROM `User` WHERE id = ?";
    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      // Check if the user exists
      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Return the user information
      const user = results[0];
      console.log("User " + user.id + " : " + user.username + " is connected");
      res.status(200).json({ userId: user.id, username: user.username });
    });
  } else {
    // If there's no session or userId in the session, return an error
    res.status(403).json({ error: "No active session or user information" });
  }
});

// Endpoint to update user course status
app.post("/api/user-progress/course", async (req, res) => {
  // Ensure the user is logged in by checking for session userId
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const { courseId, completionStatus, score } = req.body;

  try {
    const query = `
      INSERT INTO UserCourseProgress (user_id, course_id, completion_status, score) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
      completion_status = VALUES(completion_status), 
      score = VALUES(score)
    `;

    connection.query(
      query,
      [userId, courseId, completionStatus, score],
      (error, results) => {
        if (error) {
          console.error("Error updating course status: ", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res
            .status(200)
            .json({ message: "Course status updated successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Server error while updating course status: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to update user module status
app.post("/api/user-progress/module", async (req, res) => {
  // Ensure the user is logged in by checking for session userId
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const { moduleId, completionStatus, score } = req.body;

  try {
    const query = `
      INSERT INTO UserModuleProgress (user_id, module_id, completion_status, score) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
      completion_status = VALUES(completion_status), 
      score = VALUES(score)
    `;

    connection.query(
      query,
      [userId, moduleId, completionStatus, score],
      (error, results) => {
        if (error) {
          console.error("Error updating module status: ", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res
            .status(200)
            .json({ message: "Module status updated successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Server error while updating module status: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to update user content status
app.post("/api/user-progress/content", async (req, res) => {
  // Ensure the user is logged in by checking for session userId
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const { contentId, completionStatus, score } = req.body;

  try {
    const query = `
      INSERT INTO UserContentProgress (user_id, content_id, completion_status, score) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
      completion_status = VALUES(completion_status), 
      score = VALUES(score)
    `;

    connection.query(
      query,
      [userId, contentId, completionStatus, score],
      (error, results) => {
        if (error) {
          console.error("Error updating content status: ", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res
            .status(200)
            .json({ message: "Content status updated successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Server error while updating content status: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Market API
// Get top losers and winners for NASDAQ 100
app.get("/api/stocks/movers", async (req, res) => {
  try {
    const { topLosers, topWinners } = await getTopLosersAndWinners();
    res.status(200).json({ topWinners, topLosers });
  } catch (error) {
    console.error("Error in /api/nasdaq:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/stocks/top-volume", async (req, res) => {
  try {
    const topVolumeTraded = await getTopVolumeTraded();
    res.status(200).json({ topVolumeTraded });
  } catch (error) {
    console.error("Error in /api/stocks/top-volume-traded", error);
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
  const query = "SELECT * FROM NewsPage ORDER BY Date DESC LIMIT 10";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching news:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json(results);
    }
  });
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

app.get("/api/news/:id", (req, res) => {
  // Retrieve the ID from the request parameters
  const newsId = req.params.id; // Construct the SQL query to fetch the specific news article

  const query = "SELECT * FROM NewsPage WHERE ID = ?"; // Query the database, passing the newsId to prevent SQL injection

  connection.query(query, [newsId], (err, results) => {
    if (err) {
      console.error("Error fetching news article:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // Check if we got a result
      if (results.length > 0) {
        // Send the first (and should be only) entry from the results
        res.status(200).json(results[0]);
      } else {
        // If no results, the article with this ID does not exist
        res.status(404).json({ error: "News article not found" });
      }
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
