interface LanguageVersionTable {
  [key: string]: string;
}
const languageVersions: LanguageVersionTable = {
  java: "15.0.2",
};

interface PistonResponse {
  language: string;
  version: number;
  run: {
    output: string;
    stderr: string;
    stdout: string;
    code: number;
    signal: number | null;
  };
}

interface Script {
  name: string;
  content: string;
}

export default async function execute(
  mainFile: Script,
  additionalFiles: Script[],
  language: string
): Promise<PistonResponse> {
  if (language === "java") {
    additionalFiles.forEach((file) => {
      // Remove "public" from "public class ___" declaration
      file.content = file.content.replace(/public class/, "class");

      // Append the content of the additional file to the main file
      mainFile.content += "\n" + file.content;
    });
  }

  let program = {
    files: [mainFile],
    language,
    version: languageVersions[language] ?? "0",
    args: [],
    stdin: "",
  };

  // Send a request to https://emkc.org/api/v2/piston/execute
  let res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(program),
  });

  // Parse the response
  let data = (await res.json()) as PistonResponse;
  return data;
}
