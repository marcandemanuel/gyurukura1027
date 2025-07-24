/**
 * Triggers the collapse effect for selectable tags in the DOM.
 * Returns the total duration of the effect in milliseconds.
 */
export function triggerCollapseEffect() {
  const selectableTags = [
    "P", "SPAN", "A", "BUTTON", "INPUT", "TEXTAREA", "SELECT", "IMG", "LI",
    "H1", "H2", "H3", "H4", "H5", "H6", "LABEL", "PRE", "CODE"
  ];
  let delay = 0;
  const delayIncrement = 50;
  let elementCount = 0;
  selectableTags.forEach((tagName) => {
    const elements = document.getElementsByTagName(tagName);
    for (const element of elements) {
      if (element.offsetParent !== null || element.offsetWidth > 0 || element.offsetHeight > 0) {
        setTimeout(() => {
          element.classList.add("collapsed");
        }, delay);
        delay += delayIncrement;
        elementCount++;
      }
    }
  });
  // Return the total duration (last delay + a buffer for the animation)
  return delay + 500;
}