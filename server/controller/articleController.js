import connection from "./dbConnection.js";

// POST route to create article
const postArticle = (req, res) => {
  const { news_id, content, imageLink } = req.body;
  const query =
    "INSERT INTO Article (news_id, content, imageLink) VALUES (?, ?, ?)";

  connection.query(query, [news_id, content, imageLink], (err, results) => {
    if (err) {
      console.error("Error creating article:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(201).json({ message: "Article created successfully" });
    }
  });
};

// GET route to retrieve a single article by news_id
const getArticle = (req, res) => {
  const newsId = req.params.news_id;

  const query = "SELECT * FROM Article WHERE news_id = ?";

  connection.query(query, [newsId], (err, results) => {
    if (err) {
      console.error("Error fetching article by news ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        // If multiple articles are tied to a single news_id, decide how you want to handle it
        // This will return the first one found
        res.status(200).json(results[0]);
      } else {
        res
          .status(404)
          .json({ error: "Article with provided news ID not found" });
      }
    }
  });
};

// POST route to create news and auto-create an associated article
const postNews = (req, res) => {
  const { title, subtitle, description, date, author, picture } = req.body;

  const query =
    "INSERT INTO NewsPage (Title, Subtitle, Description, Date, Author, Picture) VALUES (?, ?, ?, ?, ?, ?)";

  const values = [title, subtitle, description, date, author, picture];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error", details: err });
    } else {
      // News added successfully, now create an article with the news_id, author, and title
      const articleQuery =
        "INSERT INTO Article (news_id, author, title) VALUES (?, ?, ?)";
      const articleValues = [results.insertId, author, title];

      connection.query(articleQuery, articleValues, (error, articleResults) => {
        if (error) {
          console.error("Error creating article:", error);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.status(201).json({
            message: "News and initial article added successfully",
            newsId: results.insertId,
            articleId: articleResults.insertId,
          });
        }
      });
    }
  });
};

// GET route to retrieve news
const getNews = (req, res) => {
  const query = "SELECT * FROM NewsPage ORDER BY Date DESC LIMIT 10";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching news:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json(results);
    }
  });
};

export { postArticle, getArticle, postNews, getNews };
