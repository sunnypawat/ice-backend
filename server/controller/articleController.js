// articleController.js
import connection from "./dbConnection"; // Adjust the path accordingly

function createArticle(title, content, imageLink) {
  const query =
    "INSERT INTO Article (title, content, imageLink) VALUES (?, ?, ?)";

  connection.query(query, [title, content, imageLink], (error, results) => {
    if (error) {
      console.error("Error creating article:", error);
    } else {
      console.log("Article created successfully");
    }
  });
}

function getArticles(callback) {
  const query = "SELECT * FROM Article";

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error getting articles:", error);
    } else {
      callback(results);
    }
  });
}

module.exports = {
  createArticle,
  getArticles,
};
