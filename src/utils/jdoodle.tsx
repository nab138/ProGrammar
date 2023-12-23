import axios from "axios";
import { auth } from "./firebase";

interface LanguageVersionTable {
  [key: string]: string;
}
const languageVersions: LanguageVersionTable = {
  java: "4",
};

interface JdoodleResponse {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
  compilationStatus?: string;
}
export default async function execute(
  script: string,
  language: string
): Promise<JdoodleResponse> {
  var program = {
    script: script,
    language: language,
    versionIndex: languageVersions[language] ?? "0",
  };

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in");
  }
  try {
    let res = await axios.post(
      "https://programmar.vercel.app/api/execute",
      program,
      {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    if (err instanceof Error) {
      return {
        output: "An Error Occured: " + err.message,
        statusCode: 500,
        memory: "",
        cpuTime: "",
      };
    } else {
      return {
        output: "An unknown error occurred: " + err,
        statusCode: 500,
        memory: "",
        cpuTime: "",
      };
    }
  }
}
