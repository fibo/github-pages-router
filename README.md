# GitHub Pages router

> A client side router for GitHub Pages, with View Transitions API

## Usage

Declare routes and links using `ghp-*` custom elements, for example

```html
<ghp-router>
  <ghp-route route="./" content="./articles/overview.html"></ghp-route>
  <ghp-route route="./usage" content="./articles/usage.html"></ghp-route>

  <nav>
    <ghp-navlink>
      <a href="./">Overview</a>
    </ghp-navlink>

    <ghp-navlink>
      <a href="./usage">Usage</a>
    </ghp-navlink>
  </nav>

  <main>
    <!-- Content will be loaded here -->
  </main>
</ghp-router>
```

See [documentation and examples here](https://fibo.github.io/github-pages-router/).

## License

[MIT](http://fibo.github.io/mit-license)
