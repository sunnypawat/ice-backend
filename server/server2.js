import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
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
  getTopLosersAndWinners,
  getTopVolumeStocks,
  getTopVolumeTraded,
  getAllStockData,
  getPreviousCloseTopFive,
  getOpeningTopFive,
} from "./controller/marketController.js";
import { fetchAllData } from "./controller/dataFetcher.js";

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

app.listen(PORT, () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  console.log(`Server start on port ${PORT} at ${dateTime}`);
});
