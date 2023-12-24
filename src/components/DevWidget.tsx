import { IonButton, IonFab, IonFabButton, IonIcon, IonPopover } from "@ionic/react";
import { bug } from "ionicons/icons";
import React, { useState } from "react";
import Draggable from "react-draggable";
import { useHistory } from "react-router";

const DevWidget: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: React.MouseEvent | undefined;
  }>({ open: false, event: undefined });

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
    <Draggable onDrag={handleDrag}>
      <IonFabButton onClick={handleClick}>
        <IonIcon icon={bug} />
        <IonPopover
          isOpen={showPopover.open}
          event={showPopover.event}
          onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
        >
          <IonButton
            expand="full"
            onClick={() => console.log("Button 1 clicked")}
          >
            Button 1
          </IonButton>
          <IonButton
            expand="full"
            onClick={() => console.log("Button 2 clicked")}
          >
            Button 2
          </IonButton>
        </IonPopover>
      </IonFabButton>
    </Draggable>
  );
};

export default DevWidget;
