const anchorSelector = "nav a";
const contentMap = new Map();
const contentElement = document.querySelector("main");

const { baseURI } = document;

const routes = [];

routes.push({ route: "./setup", contentUrl: "./articles/setup.html" });
routes.push({ route: "./", contentUrl: "./articles/overview.html" });

function contentUrlFromLocation(url) {
  const matchedRoute = routes.find(
    ({ route }) => url == new URL(route, baseURI),
  );
  if (matchedRoute) return new URL(matchedRoute.contentUrl, baseURI).toString();
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
