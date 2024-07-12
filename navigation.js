const anchorSelector = "nav a";
const anchorWithHrefSelector = (href) => `${anchorSelector}[href=".${href}"]`;
const selectedClass = "selected";
const contentMap = new Map();
const contentElement = document.querySelector("main");

const defaultRouteHref = "/articles/overview.html";
const routes = new Map()
  .set(defaultRouteHref, "/overview")
  .set("/articles/setup.html", "/setup");

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

function updateHistory(anchor) {
  const url = new URL(anchor.href);
  history.pushState({}, "", routes.get(url.pathname));
}

function navigate(anchor) {
  if (anchor.classList.contains(selectedClass)) return;
  updateHistory(anchor);
  if (!document.startViewTransition) return updateDOM(anchor);
  document.startViewTransition(() => {
    updateDOM(anchor);
  });
}

addEventListener("load", () => {
  for (const anchor of document.querySelectorAll(anchorSelector))
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(event.target);
    });

  const { pathname } = location;

  for (const [href, route] of routes) {
    if (pathname == route) {
      const anchor = document.querySelector(anchorWithHrefSelector(href));
      navigate(anchor);
      return;
    }
  }
  navigate(document.querySelector(anchorWithHrefSelector(defaultRouteHref)));
});
