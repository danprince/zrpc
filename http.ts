import * as http from "http";
import { ZrpcApi, ZrpcAsyncClient, invoke } from "./core";
import { RequestMessage, createErrorMessage, createReturnMessage, createCallMessage, ResponseMessage } from "./messages";

/**
 * Create a Node.js http.Server that responds to RPC requests.
 */
export function createServer<Api extends ZrpcApi>(api: Api): http.Server {
  return http.createServer(async (request, response) => {
    let data = await readJson(request);
    let message: RequestMessage;

    try {
      message = RequestMessage.parse(data);
    } catch (error) {
      let reply = createErrorMessage(error);
      return writeJson(response, 400, reply);
    }

    if (message.type === "call") {
      try {
        let method = api[message.method];
        let value = await invoke(method, message.input);
        let reply = createReturnMessage(value);
        return writeJson(response, 200, reply);
      } catch (error) {
        let reply = createErrorMessage(error);
        return writeJson(response, 400, error);
      }
    }
  });
}

export interface HttpClientProps {
  url: string;
}

/**
 * Create a Node.js http RPC client.
 */
export function createClient<Api extends ZrpcApi>(
  props: HttpClientProps
): ZrpcAsyncClient<Api> {
  return async (methodName, input) => {
    let message = createCallMessage(methodName as any, input);
    let data = await requestJson(props.url, message);
    let reply = ResponseMessage.parse(data);

    if (reply.type === "return") {
      return reply.value;
    } else {
      throw reply.error;
    }
  };
}

/**
 * Read JSON from an http.IncomingMessage and return as a promise.
 */
async function readJson(
  request: http.IncomingMessage
) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => body += chunk);
    request.on("error", error => reject(error));
    request.on("end", () => resolve(JSON.parse(body)));
  });
}

/**
 * Write JSON to a http.ServerResponse.
 */
async function writeJson(
  response: http.ServerResponse,
  statusCode: number,
  data: any,
) {
  let body = JSON.stringify(data);

  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  response.end(body);
}

/**
 * Create a http request with a JSON body.
 */
async function requestJson(url: string, data: any) {
  let body = JSON.stringify(data);

  let options: http.RequestOptions = {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    let request = http.request(url, options, response => {
      readJson(response).then(resolve, reject);
    });

    request.write(body);
    request.end();
  });
}

