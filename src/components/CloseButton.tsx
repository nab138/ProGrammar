import { IonAlert, IonIcon } from "@ionic/react";
import "./CloseButton.css";
import { close } from "ionicons/icons";
import { useHistory } from "react-router";

interface CloseButtonProps {
  isLesson?: boolean;
}
const CloseButton: React.FC<CloseButtonProps> = ({ isLesson }) => {
  let history = useHistory();
  return (
    <>
      <IonIcon
        icon={close}
        slot="end"
        className="close-button"
        id={isLesson ? "present-alert" : ""}
        onClick={() => {
          if (!isLesson) history.goBack();
        }}
      />
      <IonAlert
        header="Leaving so soon?"
        message="If you leave now, you'll lose progress within your lesson."
        trigger={isLesson ? "present-alert" : ""}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {},
          },
          {
            text: "OK",
            role: "confirm",
            handler: () => {
              history.push("/courses");
            },
          },
        ]}
        onDidDismiss={({ detail }) =>
          console.log(`Dismissed with role: ${detail.role}`)
        }
      ></IonAlert>
    </>
  );
};

export default CloseButton;
