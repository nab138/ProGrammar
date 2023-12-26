const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const fs = require("fs");
const port = 8081;
app.use(cors());
app.use(express.json());

app.post("/api/courses", (req, res) => {
  try {
    const dirPath = path.resolve(req.body.dir);
    const coursesPath = path.join(dirPath, "courses.json");
    const courses = require(coursesPath);
    res.send(courses);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

app.post("/api/getCourse", (req, res) => {
  try {
    const dirPath = path.resolve(req.body.course);

    let course = require(dirPath);
    console.log(course.units);
    res.send(course);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

// A new endpoint to write a new course.json file
app.post("/api/writeCourse", (req, res) => {
  try {
    const dirPath = path.resolve(req.body.course);
    fs.writeFile(dirPath, JSON.stringify(req.body.data), function (err) {
      if (err) throw err;
    });
    res.status(200).send("Course Saved");
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
