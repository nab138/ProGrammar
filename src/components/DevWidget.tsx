import {
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
} from "@ionic/react";
import { bug } from "ionicons/icons";
import React, { useContext, useState } from "react";
import Draggable from "react-draggable";
import { useHistory } from "react-router";
import { LessonContext } from "../LessonContext";

const DevWidget: React.FC = () => {
  const { skipToEnd } = useContext(LessonContext);
  const [dragging, setDragging] = useState(false);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: React.MouseEvent | undefined;
  }>({ open: false, event: undefined });
  const history = useHistory();

  const handleDrag = (e: any, data: any) => {
    // If the user has dragged the item, setDragging to true
    if (data.deltaX !== 0 || data.deltaY !== 0) {
      setDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragging) {
      setDragging(false);
    } else {
      setShowPopover({ open: true, event: e });
    }
  };
  return (
    <Draggable disabled={showPopover.open} onDrag={handleDrag}>
      <IonFabButton onClick={handleClick}>
        <IonIcon icon={bug} />
        <IonPopover
          isOpen={showPopover.open}
          event={showPopover.event}
          onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
        >
          <IonList>
            <IonItem
              button={true}
              detail={false}
              onClick={async () => {
                await skipToEnd();
              }}
            >
              Skip to end of lesson
            </IonItem>
            <IonItem
              button={true}
              detail={false}
              onClick={() => {
                history.go(0);
              }}
            >
              Reload (Wipe State)
            </IonItem>
          </IonList>
        </IonPopover>
      </IonFabButton>
    </Draggable>
  );
};

export default DevWidget;
