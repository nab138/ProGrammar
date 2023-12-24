import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Lesson } from "./structures";
import LessonEditor from "./components/LessonEditor";

function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();

  return (
    <>
      <Sidebar setSelectedLesson={setSelectedLesson} />
      <div className="app">
        <header>
          <h1>Lesson Builder</h1>
        </header>
        {selectedLesson !== undefined && (
          <LessonEditor lesson={selectedLesson} />
        )}
      </div>
    </>
  );
}

export default App;
