import axios from "axios";
import { supabase } from "./supabaseClient";

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

  const user = (await supabase.auth.getSession()).data.session?.user;
  if (!user) {
    throw new Error("No user is signed in");
  }
  try {
    let res = await supabase.functions.invoke("jdoodle-api", {
      body: program,
    });
    if (res.error) throw new Error(res.error);
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
