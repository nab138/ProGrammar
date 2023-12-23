import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSkeletonText,
} from "@ionic/react";

const LoadingCourseCard: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonSkeletonText animated></IonSkeletonText>
        </IonCardTitle>
        <IonCardSubtitle>
          <IonSkeletonText style={{ width: "60%" }} animated></IonSkeletonText>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSkeletonText animated style={{ width: "99%" }}></IonSkeletonText>
        <IonSkeletonText animated></IonSkeletonText>
        <IonSkeletonText animated style={{ width: "94%" }}></IonSkeletonText>
        <IonSkeletonText animated style={{ width: "98%" }}></IonSkeletonText>
        <IonSkeletonText animated style={{ width: "95%" }}></IonSkeletonText>
        <IonSkeletonText animated style={{ width: "70%" }}></IonSkeletonText>
      </IonCardContent>
    </IonCard>
  );
};

export default LoadingCourseCard;
