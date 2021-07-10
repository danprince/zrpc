import { invoke, ZrpcApi, ZrpcSyncClient } from "./core";

export function createClient<Api extends ZrpcApi>(
  api: Api
): ZrpcSyncClient<Api> {
  return (methodName, input) => {
    let method = api[methodName];
    return invoke(method, input);
  };
}
