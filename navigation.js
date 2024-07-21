const anchorSelector = "nav a";
const contentMap = new Map();
const contentElement = document.querySelector("main");

const defaultRouteHref = "/articles/overview.html";
const { baseURI } = document;

function contentUrlFromLocation(url) {
  if (url == new URL("./setup", baseURI).toString())
    return new URL("/articles/setup.html", baseURI).toString();
  if (url == new URL("./", baseURI).toString())
    return new URL("/articles/overview.html", baseURI).toString();
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

function viewTransition(contentUrl) {
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
      const contentUrl = contentUrlFromLocation(href);
      if (!contentUrl) return;
      history.pushState({}, "", href);
      viewTransition(contentUrl);
    });

  const contentUrl = contentUrlFromLocation(location.toString());
  if (contentUrl) viewTransition(contentUrl);
});

addEventListener("popstate", () => {
  const contentUrl = contentUrlFromLocation(location.toString());
  if (contentUrl) viewTransition(contentUrl);
});
