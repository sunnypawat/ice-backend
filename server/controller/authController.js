// authController.js
import dbConnection from "./dbConnection.js"; // Adjust the path accordingly
import bcrypt from "bcrypt";

function login(username, password, callback) {
  const query = "SELECT * FROM User WHERE username = ?";
  connection.query(query, [username], async (error, results) => {
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      // Check if the user exists
      if (results.length === 0) {
        callback({ error: "Invalid username or password" });
        return;
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(
        password,
        results[0].password
      );

      if (isPasswordValid) {
        callback({ message: "Login successful" });
      } else {
        callback({ error: "Invalid username or password" });
      }
    }
  });
}

module.exports = {
  login,
};
