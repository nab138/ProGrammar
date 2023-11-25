import { useParams } from "react-router";
import LessonPage from "./Lesson";

const LessonContainer: React.FC = () => {
  let { id } = useParams<{ id: string }>();
  return <LessonPage key={id} id={id} />;
};

export default LessonContainer;
