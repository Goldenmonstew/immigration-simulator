/**
 * A path under the site root, with the base path when the site is served
 * from a subdirectory (GitHub Pages project site). Next prefixes its own
 * links and bundles; plain asset URLs need this.
 */
export const asset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
