import type { IResourceItem } from "../../../contexts/resource/types";
import { removeLeadingTrailingSlashes } from "../router/remove-leading-trailing-slashes";

/**
 * Picks the resource based on the provided identifier.
 * Identifier fallbacks to `name` if `identifier` is not explicitly provided to the resource.
 */
export const pickResource = (
  identifier?: string,
  resources: IResourceItem[] = [],
): IResourceItem | undefined => {
  if (!identifier) {
    return undefined;
  }

  let resource = resources.find((r) => r.identifier === identifier);
  if (!resource) {
    resource = resources.find((r) => r.name === identifier);
  }

  return resource;
};
