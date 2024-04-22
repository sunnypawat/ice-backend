// userController.js
import bcrypt from "bcrypt";
import connection from "./dbConnection.js";

const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate the username length
    if (username.length <= 3) {
      return res
        .status(402)
        .json({ error: "Username must be longer than 3 characters." });
    }

    // Validate the password length
    if (password.length <= 7) {
      return res
        .status(403)
        .json({ error: "Password must be longer than 7 characters." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
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
};

const loginUser = async (req, res) => {
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
};

// Make sure to add a logout endpoint to destroy the session
const logoutUser = function (req, res) {
  req.session.destroy(function (error) {
    if (error) {
      res.status(500).json({ error: "Could not log out, please try again" });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  });
};

const testUser = (req, res) => {
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
};

export { createUser, loginUser, logoutUser, testUser };
