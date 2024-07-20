const anchorSelector = "nav a";
const anchorWithHrefSelector = (href) => `${anchorSelector}[href=".${href}"]`;
// TODO const selectedClass = "selected";
const contentMap = new Map();
const contentElement = document.querySelector("main");

const defaultRouteHref = "/articles/overview.html";
const routes = new Map()
  .set(defaultRouteHref, "/overview")
  .set("/articles/setup.html", "/setup");

function contentUrlFromLocation(url) {
  if (url.endsWith("setup")) return "/articles/setup.html";
  if (url.endsWith("overview")) return "/articles/overview.html";
  return "/articles/not-found.html";
}

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

// TODO
// function updateNavigation(anchor) {
//   document
//     .querySelector(`${anchorSelector}.${selectedClass}`)
//     ?.classList.remove(selectedClass);
//   anchor.classList.add(selectedClass);
// }

function pushHistory(href) {
  history.pushState({}, "", href);
}

function viewTransition(href) {
  // TODO try location = new URL(document.baseURI, href)
  const contentUrl = contentUrlFromLocation(href);
  if (!document.startViewTransition) return updateContent(contentUrl);
  document.startViewTransition(() => {
    updateContent(contentUrl);
  });
}

addEventListener("load", () => {
  for (const anchor of document.querySelectorAll(anchorSelector))
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      const href = event.target.href;
      // TODO if (anchor.classList.contains(selectedClass)) return;
      pushHistory(href);
      viewTransition(href);
    });

  viewTransition(location.toString());
});

addEventListener("popstate", () => {
  viewTransition(location.toString());
});
