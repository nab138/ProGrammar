import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
} from "@ionic/react";
import "./LoginModal.css";
import { toast } from "sonner";

import {
  login,
  resetPassword,
  signup,
  verifyEmail,
} from "../utils/supabaseClient";

interface LoginModalProps {
  isOpen: boolean;
  onClosed?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClosed }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isVerifyEmail, setIsVerifyEmail] = useState(false);

  const handleLogin = async () => {
    login(email, password);
  };

  const handleSignup = async () => {
    if (username.length < 3) {
      toast.warning("Invalid Username", {
        description: "Username must be at least 3 characters long.",
      });
      return;
    }
    if (displayName.length < 2) {
      toast.warning("Invalid Display Name", {
        description: "Display name must be at least 2 characters long.",
      });
      return;
    }
    await signup(username, email, displayName, password);
    toast.success("Account Created!", {
      description: "Please check your email for a verification code.",
    });
    setIsVerifyEmail(true);
  };

  const handleVerifyEmail = () => {
    verifyEmail(otp, email);
  };

  const handleResetPassword = () => {
    resetPassword(email);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClosed}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login to ProGrammar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="login-modal-content">
          <h1 className="ion-text-center">
            {isVerifyEmail
              ? "Enter your one-time code"
              : isResetPassword
              ? "Reset your password"
              : `Welcome ${isSignup ? "" : "back"} to ProGrammar!`}
          </h1>
          <IonList className="login-buttons">
            {!isVerifyEmail && isSignup && (
              <>
                <IonItem>
                  <IonLabel position="floating">Username</IonLabel>
                  <IonInput
                    value={username}
                    onInput={(e) =>
                      setUsername((e.target as HTMLInputElement).value)
                    }
                    type="text"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Display Name</IonLabel>
                  <IonInput
                    value={displayName}
                    onInput={(e) =>
                      setDisplayName((e.target as HTMLInputElement).value)
                    }
                    type="text"
                  />
                </IonItem>
              </>
            )}
            {!isVerifyEmail && (
              <IonItem>
                <IonLabel position="floating">Email</IonLabel>
                <IonInput
                  value={email}
                  onInput={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                  type="email"
                />
              </IonItem>
            )}
            {!isResetPassword && !isVerifyEmail && (
              <IonItem>
                <IonLabel position="floating">Password</IonLabel>
                <IonInput
                  value={password}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  type="password"
                ></IonInput>
              </IonItem>
            )}
            {isVerifyEmail && (
              <IonItem>
                <IonLabel position="floating">Verification Code</IonLabel>
                <IonInput
                  value={otp}
                  onInput={(e) => setOtp((e.target as HTMLInputElement).value)}
                  type="text"
                ></IonInput>
              </IonItem>
            )}
            <IonButton
              expand="block"
              onClick={
                isVerifyEmail
                  ? handleVerifyEmail
                  : isResetPassword
                  ? handleResetPassword
                  : isSignup
                  ? handleSignup
                  : handleLogin
              }
            >
              {isVerifyEmail
                ? "Verify"
                : isResetPassword
                ? "Send Reset Email"
                : isSignup
                ? "Sign up"
                : "Log in"}
            </IonButton>
            <div className="login-links">
              {!isSignup && !isResetPassword && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setIsSignup(true);
                  }}
                >
                  Don't have an account? Sign up!
                </p>
              )}
              {!isSignup && !isResetPassword && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setIsResetPassword(true);
                  }}
                >
                  Forgot Your Password?
                </p>
              )}
              {!isVerifyEmail && isSignup && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setIsSignup(false);
                  }}
                >
                  Already have an account? Log in!
                </p>
              )}
              {!isVerifyEmail && isResetPassword && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setIsResetPassword(false);
                  }}
                >
                  Back to login
                </p>
              )}
            </div>
          </IonList>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default LoginModal;
