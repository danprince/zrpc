import { z } from "zod";

type MaybePromise<T> = T | Promise<T>;

/**
 * A mapping from method names to method definitions.
 */
export interface ZrpcApi {
  [methodName: string]: ZrpcMethod<any, any, any>;
}

/**
 * A method definition with an input schema, and output schema, and an
 * implementation handler.
 */
export interface ZrpcMethod<
  Input extends z.ZodTypeAny,
  Output extends z.ZodTypeAny,
  Return extends MaybePromise<z.infer<Output>>,
> {
  input: Input;
  output: Output;
  handler(input: z.infer<Input>): Return;
}

/**
 * Given a method, infer the type of the input.
 */
export type InferInput<
  Method extends ZrpcMethod<any, any, any>
> = (
  z.infer<Method["input"]>
);

/**
 * Given a method, infer the type of the output.
 */
export type InferOutput<
  Method extends ZrpcMethod<any, any, any>
> = (
  z.infer<Method["output"]>
);

export type ZrpcClient<Api extends ZrpcApi> =
  | ZrpcSyncClient<Api>
  | ZrpcAsyncClient<Api>;

/**
 * Synchronous client that returns the result of the call directly.
 */
export interface ZrpcSyncClient<Api extends ZrpcApi> {
  <Key extends keyof Api>(
    methodName: Key,
    input: InferInput<Api[Key]>
  ): InferOutput<Api[Key]>
}

/**
 * Asynchronous client that returns a promise that resolves/rejects with
 * the result of the call.
 */
export interface ZrpcAsyncClient<Api extends ZrpcApi> {
  <Key extends keyof Api>(
    methodName: Key,
    input: InferInput<Api[Key]>
  ): (
    Promise<InferOutput<Api[Key]>>
  )
}

/**
 * Helper for defining an api that makes use of inferred generics to get
 * type safety.
 */
export function api<Api extends ZrpcApi>(api: Api) {
  return api;
}

/**
 * Helper for defining methods that make use of inferred generics to get type
 * safety in the handler function.
 */
export function method<
  Input extends z.ZodTypeAny,
  Output extends z.ZodTypeAny,
  Return extends MaybePromise<z.infer<Output>>,
> (
  method: ZrpcMethod<Input, Output, Return>
) {
  return method;
}

/**
 * Helper for invoking a method and validating the input & output.
 */
export function invoke<
  Method extends ZrpcMethod<any, any, any>
> (
  method: Method,
  input: InferInput<Method>,
) {
  method.input.parse(input);

  let output = method.handler(input);

  if (output instanceof Promise) {
    return output.then(value => method.output.parse(value));
  } else {
    return method.output.parse(output);
  }
}

