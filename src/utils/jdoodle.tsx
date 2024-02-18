import { supabase } from "./supabaseClient";
import SockJS from "sockjs-client";
import AbstractXHRObject from "sockjs-client/lib/transport/browser/abstract-xhr";
import { Client, over } from "webstomp-client";
import { Script } from "./structures";

// Jdoodle is expensive and this code is extremely jank, so we're going to try the Piston API

const _start = AbstractXHRObject.prototype._start;

AbstractXHRObject.prototype._start = function (
  method: any,
  url: any,
  payload: any,
  opts: any
) {
  if (!opts) {
    opts = { noCredentials: true };
  }
  return _start.call(this, method, url, payload, opts);
};

interface JdoodleLanguageVersionTable {
  [key: string]: number;
}
export const jdoodleLanguageVersions: JdoodleLanguageVersionTable = {
  java: 4,
};

interface JdoodleResponse {
  output: string;
  statusCode: number;
  compilationStatus?: string;
}

let socketClient: Client | null = null;
let wsNextId: number = 1;
let currentToken: string | null = null;
let currentCallback: ((res: JdoodleResponse) => void) | null = null;
export default async function jdoodleExecute(
  mainFile: Script,
  additionalFiles: Script[],
  language: string
): Promise<JdoodleResponse> {
  let myMainFile = { ...mainFile };
  if (language === "java") {
    myMainFile.content = myMainFile.content.substring(
      0,
      myMainFile.content.lastIndexOf("}")
    );
    myMainFile.content = "import java.io.*;\n" + myMainFile.content;
    additionalFiles.forEach((file) => {
      let myFile = { ...file };
      // Remove "public" from "public class ___" declaration
      myFile.content = file.content.replace("public class", "static class");

      // Append the content of the additional file to the main file
      myMainFile.content += "\n" + myFile.content;
    });
  }
  myMainFile.content += "\n}";
  var program = {
    script: myMainFile.content,
    language: language,
    versionIndex: jdoodleLanguageVersions[language] ?? "0",
  };

  const user = (await supabase.auth.getSession()).data.session?.user;
  if (!user) {
    throw new Error("No user is signed in");
  }
  try {
    let res = await supabase.functions.invoke("jdoodle-api");
    if (res.error) throw new Error(res.error);

    // Get the WebSocket token
    currentToken = res.data;

    // Set up the WebSocket connection
    await setupWebSocketConnection();

    return new Promise((resolve, reject) => {
      currentCallback = (res: JdoodleResponse) => {
        resolve(res);
      };
      awaitWSResponse(program);
    });
  } catch (err) {
    if (err instanceof Error) {
      return {
        output: "An Error Occured: " + err.message,
        statusCode: 500,
      };
    } else {
      return {
        output: "An unknown error occurred: " + err,
        statusCode: 500,
      };
    }
  }
}

async function awaitWSResponse(program: any) {
  socketClient?.subscribe("/user/queue/execute-i", (message: any) => {
    console.log("Received message: ", message);
    if (currentCallback == null) {
      console.log("No callback set");
      return;
    }
    // Check the status code of the message
    let msgId = message.headers["message-id"];
    let msgSeq = parseInt(msgId.substring(msgId.lastIndexOf("-") + 1));

    let statusCode = parseInt(message.headers.statusCode);

    if (statusCode === 201) {
      wsNextId = msgSeq + 1;
      return;
    }

    let t0;
    try {
      t0 = performance.now();
      while (performance.now() - t0 < 2500 && wsNextId !== msgSeq) {}
    } catch (e) {}

    if (statusCode === 204) {
      //executionTime = message.body
    } else if (statusCode === 500 || statusCode === 410) {
      currentCallback({
        output: "A server error occurred: " + message.body,
        statusCode,
      });
    } else if (statusCode === 206) {
      //outputFiles = JSON.parse(message.body)
      //returns file list - not supported in this custom api
    } else if (statusCode === 429) {
      currentCallback({
        output: "Reach execution limit",
        statusCode,
      });
    } else if (statusCode === 400) {
      currentCallback({
        output: "Invalid Request: token expired? " + message.body,
        statusCode,
      });
    } else if (statusCode === 401) {
      currentCallback({
        output: "Unauthorized Request: " + message.body,
        statusCode,
      });
    } else if (statusCode === 200) {
      currentCallback({
        output: message.body,
        statusCode: statusCode,
      });
    } else {
      console.log("Unknown error");
    }

    wsNextId = msgSeq + 1;
  });

  if (currentToken == null) {
    if (currentCallback != null) {
      currentCallback({
        output: "Invalid Token",
        statusCode: 500,
      });
    }
    return;
  }
  socketClient?.send("/app/execute-ws-api-token", JSON.stringify(program), {
    message_type: "execute",
    token: currentToken,
  });
}

function setupWebSocketConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    socketClient = over(new SockJS("https://api.jdoodle.com/v1/stomp"), {
      heartbeat: false,
      debug: true,
    });
    socketClient.connect(
      {},
      () => {
        //console.log("connection succeeded");

        resolve();
      },
      (e: any) => {
        //console.log("connection failed");
        console.log(e);

        reject(e);
      }
    );
  });
}

export async function submitInput(input: string): Promise<JdoodleResponse> {
  if (socketClient == null) {
    throw new Error("WebSocket connection is not set up");
  }
  return new Promise((resolve, reject) => {
    currentCallback = (res: JdoodleResponse) => {
      resolve(res);
    };
    if (currentToken == null) {
      let err = {
        output: "Invalid Token",
        statusCode: 500,
      } as JdoodleResponse;
      reject(err);
      return;
    }
    socketClient?.send("/app/execute-ws-api-token", input + "\n", {
      message_type: input ? "input" : "execute",
      token: currentToken,
    });
  });
}
