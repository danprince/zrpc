import { ZrpcApi, ZrpcAsyncClient } from "./core";
import { createCallMessage, RequestMessage, ResponseMessage } from "./messages";

export interface FetchClientProps {
  url: string;
}

export function createClient<Api extends ZrpcApi>(
  props: FetchClientProps
): ZrpcAsyncClient<Api> {
  return async (methodName, input) => {
    let message = createCallMessage(methodName as string, input);

    let response = await fetch(props.url, {
      method: "post",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = await response.json();
    let reply = ResponseMessage.parse(data);

    if (reply.type === "return") {
      return reply.value;
    } else {
      throw reply.error;
    }
  };
}
