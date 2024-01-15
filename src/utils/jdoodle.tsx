import { supabase } from "./supabaseClient";
import SockJS from "sockjs-client";
import AbstractXHRObject from "sockjs-client/lib/transport/browser/abstract-xhr";
import { Client, over } from "webstomp-client";

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

interface LanguageVersionTable {
  [key: string]: number;
}
const languageVersions: LanguageVersionTable = {
  java: 4,
};

interface JdoodleResponse {
  output: string;
  statusCode: number;
  compilationStatus?: string;
}

let socketClient: Client | null = null;
let wsNextId: number = 1;
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
    let res = await supabase.functions.invoke("jdoodle-api");
    if (res.error) throw new Error(res.error);

    // Get the WebSocket token
    const token = res.data;

    // Set up the WebSocket connection
    await setupWebSocketConnection();

    // Return a promise that resolves with the output from the WebSocket
    return new Promise((resolve, reject) => {
      socketClient?.subscribe("/user/queue/execute-i", (message: any) => {
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
          reject({
            output: "A server error occurred: " + message.body,
            statusCode,
          });
        } else if (statusCode === 206) {
          //outputFiles = JSON.parse(message.body)
          //returns file list - not supported in this custom api
        } else if (statusCode === 429) {
          reject({
            output: "Reach execution limit",
            statusCode,
          });
        } else if (statusCode === 400) {
          reject({
            output: "Invalid Request: token expired? " + message.body,
            statusCode,
          });
        } else if (statusCode === 401) {
          reject({
            output: "Unauthorized Request: " + message.body,
            statusCode,
          });
        } else if (statusCode === 200) {
          resolve({
            output: message.body,
            statusCode: statusCode,
          });
        } else {
          console.log("Unknown error");
        }

        wsNextId = msgSeq + 1;
      });

      socketClient?.send("/app/execute-ws-api-token", JSON.stringify(program), {
        message_type: "execute",
        token,
      });
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

function setupWebSocketConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    socketClient = over(new SockJS("https://api.jdoodle.com/v1/stomp"), {
      heartbeat: false,
      debug: true,
    });
    socketClient.connect(
      {},
      () => {
        console.log("connection succeeded");

        resolve();
      },
      (e: any) => {
        console.log("connection failed");
        console.log(e);

        reject(e);
      }
    );
  });
}

function onWsConnectionFailed(e: any) {
  console.log("connection failed");
  console.log(e);
}
