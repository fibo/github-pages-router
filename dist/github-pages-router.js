(function GitHubPagesRouter() {
  const contentMap = new Map();
  const { baseURI } = document;
  const routes = [];
  routes.push({ route: "./", contentUrl: "./articles/overview.html" });
  routes.push({ route: "./setup", contentUrl: "./articles/setup.html" });
  routes.push({ route: "./usage", contentUrl: "./articles/usage.html" });
  const navlinks = new Set();
  function contentUrlFromLocation(url) {
    const matchedRoute = routes.find(
      ({ route }) => url == new URL(route, baseURI),
    );
    if (matchedRoute)
      return new URL(matchedRoute.contentUrl, baseURI).toString();
  }
  function defineComponent(elementName, ElementClass) {
    if (!customElements.get(elementName))
      customElements.define(elementName, ElementClass);
  }
  class GHPRouter extends HTMLElement {
    contentElement = void 0;
    connectedCallback() {
      addEventListener("popstate", this);
      const contentUrl = contentUrlFromLocation(location.toString());
      if (contentUrl) this.viewTransition(contentUrl);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main",
      );
      if (!this.contentElement) console.error("Cannot find contentElement");
    }
    handleEvent(event) {
      if (event.type == "popstate") {
        const contentUrl = contentUrlFromLocation(location.toString());
        if (contentUrl) this.viewTransition(contentUrl);
      }
    }
    navigate(event) {
      event.preventDefault();
      const { href } = event.target;
      if (href == document.location.toString()) return;
      const contentUrl = contentUrlFromLocation(href);
      if (!contentUrl) return;
      history.pushState({}, "", href);
      this.viewTransition(contentUrl);
    }
    viewTransition(contentUrl) {
      if (!document.startViewTransition) return this.updateContent(contentUrl);
      document.startViewTransition(() => {
        this.updateContent(contentUrl);
      });
    }
    async updateContent(url) {
      const { contentElement } = this;
      if (!contentElement) return;
      try {
        if (contentMap.has(url)) {
          contentElement.innerHTML = contentMap.get(url);
        } else {
          const response = await fetch(url);
          const text = await response.text();
          contentMap.set(url, text);
          contentElement.innerHTML = text;
        }
        for (const navlink of navlinks.values()) navlink.setAriaCurrent();
      } catch (error) {
        console.error(error);
      }
    }
  }
  defineComponent("ghp-router", GHPRouter);
  function findParentRouter(initialElement) {
    let { parentElement: element } = initialElement;
    while (element) {
      if (element.localName == "ghp-router") return element;
      element = element.parentElement;
    }
    throw new Error(`No ghp-router found for element ${initialElement}`);
  }
  class GHPLink extends HTMLElement {
    router = void 0;
    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }
      this.anchor?.addEventListener("click", this);
    }
    get anchor() {
      return this.querySelector("a");
    }
    handleEvent(event) {
      if (event.type == "click" && event.target == this.anchor)
        this.router?.navigate(event);
    }
  }
  defineComponent("ghp-link", GHPLink);
  class GHPNavlink extends HTMLElement {
    router = void 0;
    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }
      this.anchor?.addEventListener("click", this);
      this.setAriaCurrent();
      navlinks.add(this);
    }
    disconnectedCallback() {
      navlinks.delete(this);
    }
    get anchor() {
      return this.querySelector("a");
    }
    handleEvent(event) {
      if (event.type == "click" && event.target == this.anchor)
        this.router?.navigate(event);
    }
    setAriaCurrent() {
      const { anchor } = this;
      if (!anchor) return;
      if (anchor.href == document.location.toString()) {
        anchor.setAttribute("aria-current", "page");
      } else {
        anchor.setAttribute("aria-current", "");
      }
    }
  }
  defineComponent("ghp-navlink", GHPNavlink);
})();
