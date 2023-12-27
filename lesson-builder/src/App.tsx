import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Course, Lesson } from "./structures";
import LessonEditor from "./components/LessonEditor";

function App() {
  const [courseDir, setCourseDir] = useState<string>("");
  const [json, setJSON] = useState<Course>();
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>();

  useEffect(() => {
    if (json == undefined || courseDir == "") return;
    fetch("/api/writeCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course: courseDir, data: json }),
    }).catch((error) => {
      console.error("Error:", error);
    });
  }, [json, courseDir]);
  return (
    <>
      <Sidebar
        updateJSON={setJSON}
        setCourseDir={setCourseDir}
        setJSON={setJSON}
        setSelectedLessonIndex={setSelectedLessonIndex}
        setSelectedUnitIndex={setSelectedUnitIndex}
      />
      <div className="app">
        <header>
          <h1>Lesson Builder</h1>
        </header>
        {json !== undefined &&
          selectedLessonIndex !== undefined &&
          selectedUnitIndex !== undefined && (
            <LessonEditor
              key={
                selectedLessonIndex +
                json.units[selectedUnitIndex].lessons[selectedLessonIndex]
                  .questions.length
              }
              unitIndex={selectedUnitIndex}
              lessonIndex={selectedLessonIndex}
              updateJSON={setJSON}
              originalJSON={json}
            />
          )}
      </div>
    </>
  );
}

export default App;
