import axios from "axios";

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
    headers: {
      // Add auth headers here
    }
  };

  let res = await axios.post(
    "https://programmar.vercel.app/api/execute",
    program
  );
  return res.data;
}
