import connection from "./dbConnection.js";

// API endpoint for setting up a new quiz question
const addQuiz = (req, res) => {
  const {
    quizQuestion,
    quizImage,
    quizAnswerList,
    quizCorrectAnswer,
    courseId,
    moduleId,
    contentId,
  } = req.body;

  const query = `
      INSERT INTO Quizzes (quiz_question, quiz_image, quiz_answerlist, quiz_correct_answer, course_id, module_id, content_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [
      quizQuestion,
      quizImage,
      JSON.stringify(quizAnswerList),
      quizCorrectAnswer,
      courseId,
      moduleId,
      contentId,
    ],
    (error, results) => {
      if (error) {
        console.error("Error creating new quiz question:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(201).json({
          message: "New quiz question created successfully",
          quizId: results.insertId,
        });
      }
    }
  );
};

const getQuiz = (req, res) => {
  const { quizId } = req.params;

  const query =
    "SELECT quiz_id, quiz_question, quiz_image, quiz_answerlist FROM Quizzes WHERE quiz_id = ?";
  connection.query(query, [quizId], (error, results) => {
    if (error) {
      console.error("Error fetching quiz:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(results[0]);
  });
};

const submitQuizAnswer = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  const userId = req.session.userId;
  const { quizId } = req.params;
  const { userAnswer } = req.body;

  try {
    // Retrieve quiz details including course, module, and content IDs
    const quizResult = await connection.query(
      "SELECT quiz_correct_answer, course_id, module_id, content_id FROM Quizzes WHERE quiz_id = ?",
      [quizId]
    );

    if (quizResult.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Destructure the results for cleaner access
    const {
      quiz_correct_answer: correctAnswer,
      course_id,
      module_id,
      content_id,
    } = quizResult[0];

    const isCorrect = correctAnswer === userAnswer;

    // Insert or update the user's answer in the UserQuizScores table
    const updateResult = await connection.query(
      `INSERT INTO UserQuizScores (user_id, quiz_id, course_id, module_id, content_id, user_answer, is_correct)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          user_answer = VALUES(user_answer),
          is_correct = VALUES(is_correct)`,
      [userId, quizId, course_id, module_id, content_id, userAnswer, isCorrect]
    );

    res.status(200).json({
      message: "Answer submitted successfully",
      isCorrect: isCorrect,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Error processing your answer." });
  }
};

const getQuizAnswer = (req, res) => {
  const { quizId } = req.params;

  const query = "SELECT quiz_correct_answer FROM Quizzes WHERE quiz_id = ?";
  connection.query(query, [quizId], (error, results) => {
    if (error) {
      console.error("Error fetching correct answer:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Correct answer not found" });
    }
    res.status(200).json({ correctAnswer: results[0].quiz_correct_answer });
  });
};

export { addQuiz, getQuiz, submitQuizAnswer, getQuizAnswer };
