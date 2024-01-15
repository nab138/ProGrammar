import { useParams } from "react-router";
import CodeEditor from "./CodeEditor";

const CodeEditorContainer: React.FC = () => {
  let { lang, filename, id } = useParams<{
    lang: string;
    filename: string;
    id: string;
  }>();
  return <CodeEditor key={id} id={id} lang={lang} filename={filename} />;
};

export default CodeEditorContainer;
