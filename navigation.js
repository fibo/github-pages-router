const anchorSelector = "nav a";
const selectedClass = "selected";
const contentMap = new Map();
const contentElement = document.querySelector("main");

async function updateContent(url) {
  try {
    if (contentMap.has(url)) {
      contentElement.innerHTML = contentMap.get(url);
    } else {
      const response = await fetch(url);
      const text = await response.text();
      contentMap.set(url, text);
      contentElement.innerHTML = text;
    }
  } catch (error) {
    console.error(error);
  }
}

function updateNavigation(anchor) {
  document
    .querySelector(`${anchorSelector}.${selectedClass}`)
    ?.classList.remove(selectedClass);
  anchor.classList.add(selectedClass);
}

function updateDOM(anchor) {
  updateNavigation(anchor);
  updateContent(anchor.href);
}

addEventListener("load", () => {
  for (const anchor of document.querySelectorAll(anchorSelector))
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      if (event.target.classList.contains(selectedClass)) return;
      if (!document.startViewTransition) return updateDOM(anchor);
      document.startViewTransition(() => {
        updateDOM(anchor);
      });
    });

  document.querySelector(anchorSelector).click();
});
