// updateCourseStatusController.js
import mysql from "mysql";

import { connection } from "../dbConnection.js"; // Update this path as needed

const updateCourseStatus = (req, res) => {
  const { courseId, status } = req.body;
  const userId = req.session.userId; // assuming you store this in the session on login

  if (!userId) {
    return res.status(403).json({ error: "Not Authenticated" });
  }

  const query = `
    INSERT INTO UserCourseProgress (user_id, course_id, completion_status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
    completion_status = VALUES(completion_status)
  `;

  connection.query(query, [userId, courseId, status], (error, results) => {
    if (error) {
      console.error("Error updating course status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.status(200).json({ message: "Course status updated successfully" });
  });
};

export { updateCourseStatus };
