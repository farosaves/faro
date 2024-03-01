// export let normalize = (s: string) => s.replaceAll(/[\p{P}\s]/gu, "");
// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export let normalize = (s: string | null) => s || "";
export let serialize = (r: Range) => {
  // return normalize(r.commonAncestorContainer.textContent || "");
  return normalize(r.toString());
};
export let prepostfixes = (s: string) => {
  const snorm = normalize(s);
  const l = snorm.length;
  return [snorm.substring(0, 6), snorm.substring(l - 6, l)];
};
export let deserialize = (s: string) => {
  new Range();
};
