// userController.js
import connection from "./dbConnection"; // Adjust the path accordingly
import bcrypt from "bcrypt";

function createUser(username, password) {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
    } else {
      const query = "INSERT INTO User (username, password) VALUES (?, ?)";
      connection.query(query, [username, hashedPassword], (error, results) => {
        if (error) {
          console.error("Error creating user:", error);
        } else {
          console.log("User created successfully");
        }
      });
    }
  });
}

module.exports = {
  createUser,
};
