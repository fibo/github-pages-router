# github-pages-router development

## Local server

Start local server with

```sh
npm start
```

## Build

First install esbuild but do not add it to dependencies! Run

```sh
npm install esbuild --no-save
```

Then launch

```sh
npm run build
```

## Documentation website

The documentation website is deployed on GitHub Pages, using the `gh-pages` branch. So to publish it do something like

```sh
git switch gh-pages
git rebase main
git push
```

