import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
  createUser,
  loginUser,
  logoutUser,
  testUser,
} from "./controller/userController.js";
import {
  addCourse,
  addModule,
  addContent,
  getCourse,
  getOneCourse,
  getOneModule,
} from "./controller/courseController.js";
import {
  postCourseProgress,
  postModuleProgress,
  postContentProgress,
  getCourseProgress,
  getModuleProgress,
  getContentProgress,
  getCourseCompletion,
} from "./controller/userProgressController.js";
import {
  addQuiz,
  getQuiz,
  submitQuizAnswer,
  getQuizAnswer,
} from "./controller/quizController.js";
import {
  postArticle,
  getArticle,
  postNews,
  getNews,
} from "./controller/articleController.js";
import {
  getMarketData,
  getMarketMovers,
  getStocksTopVolumeTraded,
  getStocksKeyMetrics,
} from "./controller/marketController.js";
import { fetchNasdaqDataHandler } from "./controller/dataFetcher.js";

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"], // This should match your frontend URL
    credentials: true, // This is required to send cookies across domains
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Routes

//userController
app.post("/api/users", createUser);
app.post("/api/login", loginUser);
app.post("/api/logout", logoutUser);
app.get("/api/test/user", testUser);

//courseController
app.post("/api/courses", addCourse);
app.post("/api/modules", addModule);
app.post("/api/contents", addContent);
app.get("/api/courses", getCourse);
app.get("/api/courses/:courseId", getOneCourse); //all Modules in 1 Courses
app.get("/api/modules/:moduleId", getOneModule); //all Contents in 1 Modules

//userProgressController
app.get("/api/user-courses/completion-status", getCourseCompletion);
app.post("/api/user-progress/course", postCourseProgress);
app.post("/api/user-progress/module", postModuleProgress);
app.post("/api/user-progress/content", postContentProgress);
app.get("/api/user-progress/course", getCourseProgress);
app.get("/api/user-progress/course/:course_id/modules", getModuleProgress);
app.get(
  "/api/user-progress/course/:course_id/module/:module_id/contents",
  getContentProgress
);

//quizController
app.post("/api/quiz", addQuiz);
app.get("/api/quiz/:quizId", getQuiz);
app.post("/api/quiz/:quizId/submit", submitQuizAnswer);
app.get("/api/quiz/:quizId/answer", getQuizAnswer);

//articleController
app.post("/api/articles", postArticle);
app.get("/api/articles/:news_id", getArticle);
app.post("/api/news", postNews);
app.get("/api/news", getNews);

//marketController
app.get("/api/stocks/all-data", getMarketData);
app.get("/api/stocks/movers", getMarketMovers);
app.get("/api/stocks/top-volume", getStocksTopVolumeTraded);
app.get("/api/stocks/key-metrics", getStocksKeyMetrics);

//dataFetcher
app.get("/api/fetch-nasdaq-data", fetchNasdaqDataHandler);

app.get("/api/home", (req, res) => {
  res.json({ message: "hello world!" });
});

app.listen(PORT, () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  console.log(`Server start on port ${PORT} at ${dateTime}`);
});
