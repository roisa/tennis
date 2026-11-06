/** True when building the static GitHub Pages preview (STATIC_EXPORT=1). Inlined at build time. */
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const STATIC_NOTICE = "This is the static preview of COURTSCAPE. Sign-ups, messages and purchases open on the full site.";
