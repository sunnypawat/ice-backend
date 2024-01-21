const express = require("express");
const app = express();
const PORT = 8080;

app.get("/api/home", (req, res) => {
  res.json({ message: "hello world!" });
});

app.listen(PORT, () => {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;
  console.log(`Server start on port ${PORT} at ${dateTime}`);
});
