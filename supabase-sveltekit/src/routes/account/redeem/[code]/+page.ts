
export function load({ params, data }) {
  if (params.code === "yo") {
    return {
      codeStatus: "good",
    }
  } else if (params.code === "no") {
    return {
      codeStatus: "used",
    }
  }

  return { codeStatus: "invalid" }
}

