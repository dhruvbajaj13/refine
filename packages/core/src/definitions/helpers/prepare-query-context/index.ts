import type { QueryFunctionContext, QueryKey } from "@tanstack/react-query";

type Context =
  | QueryFunctionContext<QueryKey, any>
  | QueryFunctionContext<QueryKey, never>;

export const prepareQueryContext = (
  context: Context,
): Omit<Context, "meta"> => {
  const queryContext: Omit<Context, "meta"> = {
    queryKey: context.queryKey,
    pageParam: context.pageParam,
    client: context.client,
    direction: context.direction ?? "forward",
    signal: undefined as any,
  };

  Object.defineProperty(queryContext, "signal", {
    enumerable: true,
    get: () => {
      return context.signal;
    },
  });

  return queryContext;
};
