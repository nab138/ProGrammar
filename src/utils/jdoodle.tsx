import { supabase } from "./supabaseClient";
import SockJS from "sockjs-client";
import AbstractXHRObject from "sockjs-client/lib/transport/browser/abstract-xhr";
import { Client, VERSIONS, over } from "webstomp-client";

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
      console.log(socketClient?.connected);
      socketClient?.subscribe("/user/queue/execute-i", (message: any) => {
        console.log("received message", message);
        // Check the status code of the message
        let statusCode = parseInt(message.headers.statusCode);
        if (statusCode === 200) {
          // If the status code is 200, resolve the promise with the output
          resolve({
            output: message.body,
            statusCode: statusCode,
            memory: "",
            cpuTime: "",
          });
        } else {
          // If the status code is not 200, reject the promise with an error
          reject({
            output: "An error occurred: " + message.body,
            statusCode: statusCode,
            memory: "",
            cpuTime: "",
          });
        }
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

function setupWebSocketConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a WebSocket connection if it doesn't exist
    if (socketClient === null || !socketClient.connected) {
      socketClient = over(new SockJS("https://api.jdoodle.com/v1/stomp"), {
        heartbeat: false,
        debug: true,
        protocols: VERSIONS.supportedProtocols(),
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
    } else {
      resolve();
    }
  });
}

function onWsConnectionFailed(e: any) {
  console.log("connection failed");
  console.log(e);
}
