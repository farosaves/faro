const reg = /(?<=\|)([0-9]+)(?=\$)/
export const extractCharIdx = (s: string) =>
  parseInt(reg.exec(s)?.[0] || "")
  // reg.exec(s)
