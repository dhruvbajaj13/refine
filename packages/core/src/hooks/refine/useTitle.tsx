import { useContext } from "react";

import { RefineContext } from "@contexts/refine";

/**
 * `useTitle` returns the title configuration from the `<Refine>` context.
 * This provides access to the title icon and text configuration.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/refine/useTitle} for more details.
 */
export const useTitle = () => {
  const { options } = useContext(RefineContext);

  return options.title;
};
