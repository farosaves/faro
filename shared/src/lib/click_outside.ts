export function clickOutside(node: Node) {
  const handleClick = (event: Event) => {
    // @ts-expect-error
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      // @ts-expect-error
      node.dispatchEvent(new CustomEvent("click_outside", node));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
