<div align="center">
 <h1>
    <a href="https://github.com/lune-js/lune">
      <img alt="Lune.js - Simple, declarative, and functional library for building reactive user interfaces." src="./.github/assets/text.svg" width="400">
    </a>
  </h1>
</div>

This [Astro integration](https://docs.astro.build/en/guides/integrations/) adds [Lune.js](https://github.com/lune-js/lune) to your project so that you can use Lune.js anywhere on your page.

## Installation

```sh
npm install @lune-js/astro lune-js
```

Register the integration in your Astro config:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import lune from "@lune-js/astro";

export default defineConfig({
  integrations: [lune()]
});
```

## Usage

Write Lune directives directly in your markup — no `<script>` tag and no `createApp()` call. The integration boots a single app per page and mounts it to every top-level `lu-scope`.

```astro
---
// src/pages/index.astro
---

<html>
  <head>
    <title>Lune 🌙 x Astro 🚀</title>
  </head>
  <body>
    <div lu-scope="{ count: 1 }">
      <p lu-text="count"></p>
      <button @click="count++">increment</button>
      <button @click="count--">decrement</button>
    </div>
  </body>
</html>
```

> [!NOTE]
> Astro's template syntax claims single braces, so `{{ }}` interpolation does not work inside `.astro` files. Use `lu-text` instead.

## Options

### `entrypoint`

Extend Lune before it mounts by pointing `entrypoint` at a module whose default export receives the app instance.

```js
// astro.config.mjs
export default defineConfig({
  integrations: [lune({ entrypoint: "/src/entrypoint" })]
});
```

```ts
// src/entrypoint.ts
import type { App } from "lune-js";

export default (app: App) => {
  app.directive("focus", ({ el }) => el.focus());
};
```

Use it to register custom directives, install plugins, or put shared scope factories on `app.scope`.

## License

[MIT](./LICENSE)
