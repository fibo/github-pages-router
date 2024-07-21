(function GitHubPagesRouter() {
  const contentMap = new Map();

  const routes = [];

  routes.push({ route: "./", contentUrl: "./articles/overview.html" });
  routes.push({ route: "./setup", contentUrl: "./articles/setup.html" });
  routes.push({ route: "./usage", contentUrl: "./articles/usage.html" });

  function defineComponent(elementName, ElementClass) {
    if (!customElements.get(elementName))
      customElements.define(elementName, ElementClass);
  }

  /**
   * Web component <ghp-router>. All other ghp-* components must be inside a <ghp-router>.
   */
  class GHPRouter extends HTMLElement {
    contentElement = undefined;
    navlinks = new Set();
    connectedCallback() {
      addEventListener("popstate", this);
      const contentUrl = this.contentUrlFromLocation(location.toString());
      if (contentUrl) this.viewTransition(contentUrl);
      this.contentElement = document.querySelector(
        this.getAttribute("outlet") ?? "main",
      );
      if (!this.contentElement) console.error("Cannot find contentElement");
    }
    handleEvent(event) {
      if (event.type == "popstate") {
        const contentUrl = this.contentUrlFromLocation(location.toString());
        if (contentUrl) this.viewTransition(contentUrl);
      }
    }
    contentUrlFromLocation(url) {
      const matchedRoute = routes.find(
        ({ route }) => url == new URL(route, document.baseURI),
      );
      if (matchedRoute)
        return new URL(matchedRoute.contentUrl, document.baseURI).toString();
    }
    /**
     * Handle anchor click event.
     */
    navigate(event) {
      event.preventDefault();
      const { href } = event.target;
      if (href == document.location.toString()) return;
      const contentUrl = this.contentUrlFromLocation(href);
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
        for (const navlink of this.navlinks.values()) navlink.setAriaCurrent();
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

  /**
   * Web component <ghp-link> handles an anchor that points to a route.
   * It must wrap the anchor, and will override its click event.
   * @example
   * ```html
   * <ghp-link><a href="./some-route">Click me</a></ghp-link>
   * ```
   */
  class GHPLink extends HTMLElement {
    router = undefined;
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

  /**
   * Web component <ghp-navlink> is similar to <ghp-link> but it also adds aria-selected="page" if the anchor points to current location.
   */
  class GHPNavlink extends HTMLElement {
    router = undefined;
    connectedCallback() {
      try {
        this.router = findParentRouter(this);
      } catch (error) {
        console.error(error);
      }
      this.anchor?.addEventListener("click", this);
      this.setAriaCurrent();
      this.router?.navlinks.add(this);
    }
    disconnectedCallback() {
      this.router?.navlinks.delete(this);
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
