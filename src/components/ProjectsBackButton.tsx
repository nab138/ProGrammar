import { IonIcon } from "@ionic/react";
import "./ProjectsBackButton.css";
import { chevronBack } from "ionicons/icons";
import { useHistory } from "react-router";

export interface ProjectsBackButtonProps {
  backTo?: string;
}
const ProjectsBackButton: React.FC<ProjectsBackButtonProps> = ({ backTo }) => {
  let history = useHistory();
  return (
    <>
      <IonIcon
        icon={chevronBack}
        slot="start"
        className="projects-back-button"
        onClick={() => {
          history.push(backTo ?? "/projects");
        }}
      />
    </>
  );
};

export default ProjectsBackButton;
