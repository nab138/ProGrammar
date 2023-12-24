import { initializeApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  initializeAuth,
  updatePassword,
  updateProfile,
  browserLocalPersistence,
} from "firebase/auth";
import {
  persistentLocalCache,
  initializeFirestore,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyDttcOHxCo3Cpp4QnMYeBS50JqIZOKk67I",
  authDomain: "programmar-1d600.firebaseapp.com",
  projectId: "programmar-1d600",
  storageBucket: "programmar-1d600.appspot.com",
  messagingSenderId: "503970654989",
  appId: "1:503970654989:web:36dce781ed44dc96ec9e44",
  measurementId: "G-LE77NH4206",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export async function logInWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    logErrors(err);
  }
}

export async function registerWithEmailAndPassword(
  username: string,
  displayName: string,
  email: string,
  password: string
) {
  try {
    const usernameDocRef = doc(db, "usernames", username);
    const usernameDoc = await getDoc(usernameDocRef);

    if (usernameDoc.exists()) {
      toast.warning("Username taken", {
        description: "Please choose a different username.",
      });
    } else {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await setDoc(usernameDocRef, { uid: user.uid });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        displayName,
        authProvider: "local",
        email,
      });
    }
  } catch (err) {
    logErrors(err);
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent!", {
      description:
        "Please check your inbox for further instructions (including spam folder).",
      duration: 5000,
    });
  } catch (err) {
    logErrors(err);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    logErrors(err);
  }
}

export async function changePassword(password: string) {
  if (!auth.currentUser) {
    toast.error("Not logged in", {
      description:
        "You must be logged in to change your password. How did you get to this screen anyways?",
      duration: 4000,
    });
    return;
  }
  try {
    await updatePassword(auth.currentUser, password);
    return true;
  } catch (err) {
    logErrors(err);
    return false;
  }
}

function logErrors(err: any) {
  console.error(err);
  if (err instanceof Error) {
    if (err.name === "FirebaseError") {
      if (err.message.includes("auth/invalid-email")) {
        toast.error("Invalid email address", {
          description: "Please check the email address you entered.",
        });
        return;
      }
      if (err.message.includes("auth/missing-password")) {
        toast.error("Missing password", {
          description: "Please check the password you entered.",
        });
        return;
      }
      if (err.message.includes("auth/invalid-credential")) {
        toast.error("Incorrect Login", {
          description: "Your email or password is incorrect.",
        });
        return;
      }
      if (err.message.includes("auth/weak-password")) {
        toast.error("Password too weak", {
          description: "Your password must be at least 6 characters long.",
        });
        return;
      }
      if (err.message.includes("auth/email-already-in-use")) {
        toast.error("Email already in use", {
          description:
            "The email you entered is already in use by another account.",
        });
        return;
      }
      if (err.message.includes("auth/network-request-failed")) {
        toast.error("Unable to connect", {
          description:
            "Please check that your are connected to the internet to login or register.",
        });
        return;
      }
      if (err.message.includes("auth/requires-recent-login")) {
        toast.error("You have not logged in recently", {
          description:
            "Please log out and log back in to change your password.",
        });
        return;
      }
    }
    toast.error("An unkown error has occured.", {
      description: err.message,
      duration: 5000,
    });
  }
}
