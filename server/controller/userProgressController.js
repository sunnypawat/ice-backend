//userProgressController.js
import connection from "./dbConnection.js";

const postCourseProgress = async (req, res) => {
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
};

const postModuleProgress = async (req, res) => {
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
};

const postContentProgress = async (req, res) => {
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
};

const getCourseProgress = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;

  try {
    const query =
      "SELECT course_id, completion_status FROM UserCourseProgress WHERE user_id = ?";

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching course progress:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Server error while fetching course progress:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getModuleProgress = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const courseId = req.params.course_id;

  try {
    const query = `
        SELECT module_id, completion_status 
        FROM UserModuleProgress 
        WHERE user_id = ? AND course_id = ?
      `;

    connection.query(query, [userId, courseId], (error, results) => {
      if (error) {
        console.error("Error fetching module progress:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Server error while fetching module progress:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getContentProgress = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const courseId = req.params.course_id;
  const moduleId = req.params.module_id;

  try {
    const query = `
        SELECT content_id, completion_status 
        FROM UserContentProgress 
        WHERE user_id = ? AND course_id = ? AND module_id = ?
      `;

    connection.query(query, [userId, courseId, moduleId], (error, results) => {
      if (error) {
        console.error("Error fetching content progress:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Server error while fetching content progress:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCourseCompletion = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;

  try {
    const query = `
        SELECT c.title AS level, ucp.completion_status AS access
        FROM Courses c
        JOIN UserCourseProgress ucp ON c.id = ucp.course_id
        WHERE ucp.user_id = ?
      `;

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error(
          "Error fetching user courses with completion status:",
          error
        );
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error(
      "Server error while fetching user courses completion status:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  postCourseProgress,
  postModuleProgress,
  postContentProgress,
  getCourseProgress,
  getModuleProgress,
  getContentProgress,
  getCourseCompletion,
};
