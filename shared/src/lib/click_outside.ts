export function clickOutside(node: Node) {
  const handleClick = (event: Event) => {
    // @ts-expect-error
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      // @ts-expect-error
      node.dispatchEvent(new CustomEvent("click_outside", node))
    }
  }

  document.addEventListener("click", handleClick, true)

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true)
    },
  }
}

// export const clickOutside = (node: HTMLElement, callback: (e: MouseEvent) => void) => {
//   let handler: (e: MouseEvent) => void

//   const removeHandler = (): void => {
//     window.removeEventListener("click", handler)
//   }

//   const setHandler = (): void => {
//     removeHandler()

//     if (!callback) return

//     handler = (e: MouseEvent): void => {
//       console.log("out")

//       if (node && !node.contains(e.target) && !e.defaultPrevented) {
//         // @ts-expect-erro
//         console.log("yo")
//         // node.dispatchEvent(new CustomEvent("click_outside", node))

//         e.preventDefault()
//         callback(e)
//       }
//     }
//     window.addEventListener("click", handler)
//   }

//   setHandler()

//   return {
//     update: setHandler,
//     destroy: removeHandler,
//   }
// }
