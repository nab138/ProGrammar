import { PistonResponse, Script } from "./structures";

interface LanguageVersionTable {
  [key: string]: string;
}
const languageVersions: LanguageVersionTable = {
  java: "15.0.2",
};

export default async function execute(
  mainFile: Script,
  additionalFiles: Script[],
  language: string
): Promise<PistonResponse> {
  let myMainFile = { ...mainFile };
  if (language === "java") {
    additionalFiles.forEach((file) => {
      let myFile = { ...file };
      // Remove "public" from "public class ___" declaration
      myFile.content = file.content.replace(/public class/, "class");

      // Append the content of the additional file to the main file
      myMainFile.content += "\n" + file.content;
    });
  }

  let program = {
    files: [myMainFile],
    language,
    version: languageVersions[language] ?? "0",
    args: [],
    stdin: "",
  };

  // Send a request to https://emkc.org/api/v2/piston/execute
  try {
    let res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(program),
    });
    if (res.status == 429) {
      throw new Error(
        "You are sending too many requests. Please wait a few seconds and try again."
      );
    }
    if (!res.ok)
      throw new Error(
        "Failed to execute code: " + res.status + " " + res.statusText
      );
    let data = (await res.json()) as PistonResponse;
    return data;
  } catch (e: any) {
    return {
      language,
      version: 0,
      run: {
        output: e.message,
        stderr: "",
        stdout: "",
        code: 0,
        signal: null,
      },
    };
  }
}
