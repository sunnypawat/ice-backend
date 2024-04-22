//courseController.js
import connection from "./dbConnection.js";

const addCourse = async (req, res) => {
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
};

const getCourse = async (req, res) => {
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
};

const getOneCourse = async (req, res) => {
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
};

const addModule = async (req, res) => {
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
};

const addContent = async (req, res) => {
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
};

// Get All Content for a Specific Module
const getOneModule = async (req, res) => {
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
};

export {
  addCourse,
  addModule,
  addContent,
  getCourse,
  getOneCourse,
  getOneModule,
};
