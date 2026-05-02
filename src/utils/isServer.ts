import { createIsomorphicFn } from "@tanstack/react-start";

export const isServer = createIsomorphicFn()
  .server(() => true)
  .client(() => false);
