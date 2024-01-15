import { IonIcon } from "@ionic/react";
import "./ProjectsBackButton.css";
import { chevronBack } from "ionicons/icons";
import { useHistory } from "react-router";

const ProjectsBackButton: React.FC = () => {
  let history = useHistory();
  return (
    <>
      <IonIcon
        icon={chevronBack}
        slot="start"
        className="projects-back-button"
        onClick={() => {
          history.push("/projects");
        }}
      />
    </>
  );
};

export default ProjectsBackButton;
