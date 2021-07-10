import { z } from "zod";
import { api, method } from "../";
import { createServer, createClient } from "../http";

let rpc = api({
  double: method({
    input: z.number(),
    output: z.number(),
    handler: x => x * 2,
  }),
});

let server = createServer(rpc);
let client = createClient<typeof rpc>({ url: "http://localhost:3000" });

beforeAll(() => {
  server.listen(3000);
});

afterAll(() => {
  console.log("server close");
  server.close();
});

describe("zrpc", () => {
  it("calls method correctly", async () => {
    let result = await client("double", 3);
    expect(result).toBe(6);
  });

  it("fails with a type error if method does not exist", async () => {
    // @ts-expect-error
    let promise = client("triple", 3);
    expect(promise).rejects.toThrow("missing");
  });

  it("fails with a type error if signature is wrong", async () => {
    // @ts-expect-error
    let promise = client("double", true);
    expect(promise).rejects.toThrow("");
  });
});

