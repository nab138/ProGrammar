import { useEffect, useState } from "react";
import { Course, Lesson, Question, Unit } from "../structures";
import "./Sidebar.css";

interface SidebarProps {
  setJSON: (json: Course) => void;
  setCourseDir: (dir: string) => void;
  setSelectedUnitIndex: (index: number) => void;
  setSelectedLessonIndex: (index: number) => void;
  updateJSON: (newJson: Course) => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  setJSON,
  setCourseDir,
  setSelectedUnitIndex,
  setSelectedLessonIndex,
  updateJSON,
}) => {
  const [courses, setCourses] = useState<string[]>([]);
  const [courseName, setCourseName] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [unit, setUnit] = useState<Unit>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [directory, setDirectory] = useState<string>(
    "/home/nicholas/coding/robotics/programming-duolingo/src/courses"
  );
  const [course, setCourse] = useState<Course>();
  const [selectedUnitIndex, setSelectedUnitIndexState] = useState<number>();
  const [selectedLessonIndex, setSelectedLessonIndexState] = useState<number>();
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>();

  useEffect(() => {
    if (course) {
      updateJSON(course);
    }
  }, [course]);

  useEffect(() => {
    if (directory) {
      fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dir: directory }),
      })
        .then((response) => {
          response.json().then((data) => {
            if (data instanceof Array) {
              setCourses(data);
            }
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error: " + error);
        });
    }
  }, [directory]);

  useEffect(() => {
    if (courseName) {
      const coursePath = `${directory}/${courseName}.json`;
      setCourseDir(coursePath);
      fetch("/api/getCourse", {
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
              setCourse(course);
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
      <label htmlFor="directory">Codespace?:</label>
      <input
        type="checkbox"
        id="codespace"
        checked={directory === "/workspaces/programming-duolingo/src/courses"}
        onChange={(event) => {
          setDirectory(
            event.target.checked
              ? "/workspaces/programming-duolingo/src/courses"
              : "/home/nicholas/coding/robotics/programming-duolingo/src/courses"
          );
          setCourseName("");
        }}
      />
      <h2>Courses</h2>
      <div className="courses">
        <div className="courseList">
          {courses.map((project, index) => (
            <div
              className={
                "courseBtn" + (index === selectedCourseIndex ? " selected" : "")
              }
              key={index}
              onClick={() => {
                setCourseName(project);
                setSelectedCourseIndex(index);
              }}
            >
              {project}
            </div>
          ))}
        </div>
        <div className="courseList">
          {units.map((unit, index) => (
            <div
              className={
                "courseBtn" + (index === selectedUnitIndex ? " selected" : "")
              }
              key={index}
              onClick={() => {
                setSelectedUnitIndex(index);
                setSelectedUnitIndexState(index);
                setUnit(unit);
              }}
            >
              {unit.name}
            </div>
          ))}
          {units.length > 0 && (
            <div
              className="courseBtn addBtn"
              onClick={() => {
                if (!course) return;
                const newUnit = {
                  name: "New Unit",
                  description: "",
                  lessons: [] as Lesson[],
                  id: "new-unit",
                };
                const newCourse = { ...course };
                newCourse.units.push(newUnit);
                setCourse(newCourse);
                setUnits(newCourse.units);
              }}
            >
              Add Unit +
            </div>
          )}
        </div>
        <div className="courseList">
          {lessons.map((lesson, index) => (
            <div
              className={
                "courseBtn" + (index === selectedLessonIndex ? " selected" : "")
              }
              key={index}
              onClick={() => {
                setSelectedLessonIndex(index);
                setSelectedLessonIndexState(index);
              }}
            >
              {lesson.name}
            </div>
          ))}
          {lessons && (
            <div
              className="courseBtn addBtn"
              onClick={() => {
                if (!unit) return;
                const newLesson = {
                  name: "New Lesson",
                  description: "",
                  questions: [] as Question[],
                  id: "new-lesson",
                  type: "learn" as "learn" | "quiz",
                };
                const newUnit = { ...unit };
                newUnit.lessons.push(newLesson);
                const newCourse = { ...course } as Course;
                if (
                  newCourse === undefined ||
                  newCourse.units === undefined ||
                  selectedUnitIndex === undefined
                )
                  return;
                newCourse.units[selectedUnitIndex] = newUnit;
                setCourse(newCourse);
                setUnit(newUnit);
                setUnits(newCourse.units);
                setLessons(newUnit.lessons);
              }}
            >
              Add Lesson +
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
