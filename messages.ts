/**
 * Schemas and types for the internal JSON message formats that are used
 * for RPC communication.
 */

import { z } from "zod";

export const CallMessage = z.object({
  type: z.literal("call"),
  method: z.string(),
  input: z.any(),
});

export const ReturnMessage = z.object({
  type: z.literal("return"),
  value: z.any(),
});

export const ErrorMessage = z.object({
  type: z.literal("error"),
  error: z.any(),
});

export const RequestMessage = CallMessage;

export const ResponseMessage = z.union([
  ReturnMessage,
  ErrorMessage,
]);

export type CallMessage = z.infer<typeof CallMessage>;
export type ReturnMessage = z.infer<typeof ReturnMessage>;
export type ErrorMessage = z.infer<typeof ErrorMessage>;
export type RequestMessage = z.infer<typeof RequestMessage>;
export type ResponseMessage = z.infer<typeof ResponseMessage>;

export function createErrorMessage(error: any): ErrorMessage {
  return { type: "error", error };
}

export function createReturnMessage(value: any): ReturnMessage {
  return { type: "return", value };
}

export function createCallMessage(method: string, input: any): CallMessage {
  return { type: "call", method, input };
}

