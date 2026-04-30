import { getDefaultSerovalPlugins } from "@tanstack/react-start";
import { toJSONAsync } from "seroval";

// This serialization code is adapted from @tanstack/start-client-core/src/client-rpc/serverFnFetcher.ts
// getDefaultSerovalPlugins() not usable in this context (Error: No Start context found in AsyncLocalStorage)
// Thankfully it is not needed for our code to work
const serovalPlugins = null;

export async function serialize(params: { data?: unknown, context?: unknown }): Promise<string> {
  return JSON.stringify(
    await toJSONAsync(params, { plugins: serovalPlugins! }),
  );
}
