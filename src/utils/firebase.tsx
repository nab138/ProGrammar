import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  DocumentSnapshot,
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
const auth = getAuth(app);
const db = getFirestore(app);

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
  name: string,
  email: string,
  password: string
) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    logErrors(err);
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    logErrors(err);
  }
}

export async function loguout() {
  try {
    await signOut(auth);
  } catch (err) {
    logErrors(err);
  }
}

function logErrors(err: any) {
  console.error(err);
  if (err instanceof Error) {
    toast("An error has occured.", {
      description: err.message,
      duration: 5000,
    });
  }
}
