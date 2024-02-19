import { useState } from "react";
import { IonIcon, IonButton } from "@ionic/react";
import { chevronDownOutline, chevronForwardOutline } from "ionicons/icons";
import "./ProjectFilesHeader.css";
const ProjectFilesHeader = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="project-files-header">
      <h1 className="project-files-h1">
        Files
        <IonButton fill="clear" size="small" onClick={handleToggle}>
          <IonIcon icon={isOpen ? chevronDownOutline : chevronForwardOutline} />
        </IonButton>
      </h1>
      <div className={`project-files-content ${isOpen ? "open" : ""}`}>
        <p>
          These are all the files contained in this project. Click on one to see
          what to do in it!{" "}
          <span className="stored-locally">
            Projects are not synced to the cloud.
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProjectFilesHeader;
