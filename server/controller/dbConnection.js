// dbConnection.js
import mysql from "mysql";
import util from "util";
import dotenv from "dotenv";

dotenv.config(); // to use values from your .env file

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  // database: process.env.DB_NAME,
});

// Promisify for Node.js async/await.
connection.query = util.promisify(connection.query);

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the MySQL server.");
});

export default connection;
