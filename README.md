# zrpc

[Zod](https://github.com/colinhacks/zod) powered type-safe RPC.

```ts
// --- Define your RPC methods ---

import { z } from "zod";
import { api, method } from "zrpc";

let rpc = api({
  double: method({
    input: z.number(),
    output: z.number(),
    handler: x => x * 2,
  }),
});

export type Api = typeof rpc;

// --- Then create a server ---

import { createServer } from "zrpc/http";

let server = createServer(rpc);
server.listen(3000);

// --- Then create a client ---
import { createClient } from "zrpc/http"; // node
import { createClient } from "zrpc/fetch"; // browser
import type { Api } from "../server/rpc";

let client = createClient<Api>({ url: "http://localhost:3000" });

// --- And finally call the API ---
await client("double", 3); // === 6
```
