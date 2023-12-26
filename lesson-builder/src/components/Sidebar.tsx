import { useEffect, useState } from "react";
import { Course, Lesson, Unit } from "../structures";
import "./Sidebar.css";

interface SidebarProps {
  setSelectedLesson: (lesson: Lesson) => void;
  setJSON: (json: Course) => void;
  setCourseDir: (dir: string) => void;
  setSelectedUnitIndex: (index: number) => void;
  setSelectedLessonIndex: (index: number) => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  setSelectedLesson,
  setJSON,
  setCourseDir,
  setSelectedUnitIndex,
  setSelectedLessonIndex,
}) => {
  const [courses, setCourses] = useState<string[]>([]);
  const [courseName, setCourseName] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [unit, setUnit] = useState<Unit>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [directory, setDirectory] = useState<string>(
    "/home/nicholas/coding/robotics/programming-duolingo/src/courses"
  );

  useEffect(() => {
    if (directory) {
      fetch("http://localhost:8081/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dir: directory }),
      })
        .then((response) =>
          response.json().then((data) => {
            if (data instanceof Array) {
              setCourses(data);
            }
          })
        )
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [directory]);

  useEffect(() => {
    if (courseName) {
      const coursePath = `${directory}/${courseName}.json`;
      setCourseDir(coursePath);
      fetch("http://localhost:8081/api/getCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course: coursePath }),
      })
        .then((response) =>
          response.json().then((data) => {
            // If the data fits the Course interface
            if (data.name && data.description && data.units && data.id) {
              const course: Course = data;
              setJSON(course);
              setUnits(course.units);
            }
          })
        )
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [courseName, directory]);

  useEffect(() => {
    if (unit) {
      setLessons(unit.lessons);
    }
  }, [unit]);
  return (
    <div className="sidebar">
      <label htmlFor="directory">Directory:</label>
      <input
        type="text"
        id="directory"
        value={directory}
        onChange={(event) => {
          setDirectory(event.target.value);
          setCourseName("");
        }}
      />
      <h2>Courses</h2>
      <div className="courses">
        <div className="courseList">
          {courses.map((project, index) => (
            <div
              className="courseBtn"
              key={index}
              onClick={() => {
                setCourseName(project);
              }}
            >
              {project}
            </div>
          ))}
        </div>
        <div className="courseList">
          {units.map((unit, index) => (
            <div
              className="courseBtn"
              key={index}
              onClick={() => {
                setSelectedUnitIndex(index);
                setUnit(unit);
              }}
            >
              {unit.name}
            </div>
          ))}
        </div>
        <div className="courseList">
          {lessons.map((lesson, index) => (
            <div
              className="courseBtn"
              key={index}
              onClick={() => {
                setSelectedLessonIndex(index);
                setSelectedLesson(lesson);
              }}
            >
              {lesson.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
