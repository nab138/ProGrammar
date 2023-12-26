import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Course, Lesson } from "./structures";
import LessonEditor from "./components/LessonEditor";

function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [courseDir, setCourseDir] = useState<string>("");
  const [json, setJSON] = useState<Course>();
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>();

  const updateJson = (newJson: Course) => {
    setJSON(newJson);
    // Send a post request to the server to update the json file
    fetch("http://localhost:8081/api/writeCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course: courseDir, data: newJson }),
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <>
      <Sidebar
        setCourseDir={setCourseDir}
        setJSON={setJSON}
        setSelectedLesson={setSelectedLesson}
        setSelectedLessonIndex={setSelectedLessonIndex}
        setSelectedUnitIndex={setSelectedUnitIndex}
      />
      <div className="app">
        <header>
          <h1>Lesson Builder</h1>
        </header>
        {selectedLesson !== undefined &&
          json != undefined &&
          selectedLessonIndex !== undefined &&
          selectedUnitIndex !== undefined && (
            <LessonEditor
              unitIndex={selectedUnitIndex}
              lessonIndex={selectedLessonIndex}
              updateJSON={updateJson}
              originalJSON={json}
              lesson={selectedLesson}
            />
          )}
      </div>
    </>
  );
}

export default App;
