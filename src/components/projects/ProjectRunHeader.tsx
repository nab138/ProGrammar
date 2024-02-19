import { useEffect, useRef, useState } from "react";
import { IonIcon, IonButton } from "@ionic/react";
import { chevronDownOutline, chevronForwardOutline } from "ionicons/icons";
import "./ProjectRunHeader.css";
const ProjectRunHeader = () => {
  const [isOpen, setIsOpen] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      container.current.style.height = isOpen
        ? `${container.current.scrollHeight}px`
        : "0px";
    }
  }, [isOpen]);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="project-run-header">
      <h1 className="project-run-h1">
        Run
        <IonButton fill="clear" size="small" onClick={handleToggle}>
          <IonIcon icon={isOpen ? chevronDownOutline : chevronForwardOutline} />
        </IonButton>
      </h1>
      <div
        ref={container}
        className={`project-run-content ${isOpen ? "open" : ""}`}
      >
        <p>
          Ready to run your project? Click the run button to try it, and our
          specially written code will let you interact with your project. When
          you're happy, click test to see if you've completed the project!
        </p>
      </div>
    </div>
  );
};

export default ProjectRunHeader;
