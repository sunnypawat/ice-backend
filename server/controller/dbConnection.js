// dbConnection.js
import mysql from "mysql";

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

module.exports = connection;
