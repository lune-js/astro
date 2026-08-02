import { resolve } from "node:path";
import type { AstroIntegration } from "astro";
import type { EnvironmentOptions, Plugin } from "vite";

const NAME = "@lune-js/astro";

interface Options {
  /**
   * You can extend Lune by setting this option to a root-relative import specifier (for example, `entrypoint: "/src/entrypoint"`).
   *
   * The default export of this file should be a function that accepts an Lune instance prior to starting, allowing the use of custom directives, plugins and other customizations for advanced use cases.
   *
   * ```js
   * // astro.config.mjs
   * import { defineConfig } from "astro/config";
   * import lune from "@lune-js/astro";
   *
   * export default defineConfig({
   *   // ...
   *   integrations: [lune({ entrypoint: "/src/entrypoint" })],
   * });
   * ```
   *
   * ```js
   * // src/entrypoint.ts
   * import type { App } from "lune-js";
   * import i18nPlugin from "my-i18n-plugin";
   *
   * export default (app: App) => {
   *   app.use(i18nPlugin);
   * }
   * ```
   */
  entrypoint?: string;
}

function virtualEntrypoint(options?: Options): Plugin {
  const virtualModuleId = `virtual:${NAME}/entrypoint`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  let isBuild: boolean;
  let root: string;
  let entrypoint: string | undefined;

  return {
    name: `${NAME}/virtual-entrypoint`,
    config(_, { command }) {
      isBuild = command === "build";
    },
    configResolved(config) {
      root = config.root;
      if (options?.entrypoint) {
        entrypoint = options.entrypoint.startsWith(".") ? resolve(root, options.entrypoint) : options.entrypoint;
        console.log(entrypoint);
      }
    },
    resolveId: {
      filter: {
        id: new RegExp(`^${virtualModuleId}$`)
      },
      handler() {
        return resolvedVirtualModuleId;
      }
    },
    load: {
      filter: {
        id: new RegExp(`^${resolvedVirtualModuleId}$`)
      },
      handler() {
        if (entrypoint) {
          return `\
import * as mod from ${JSON.stringify(entrypoint)};

export const setup = (app) => {
  if ("default" in mod) {
    mod.default(app);
  } else {
    ${
      !isBuild
        ? `console.warn("[${NAME}] entrypoint \`" + ${JSON.stringify(
            entrypoint
          )} + "\` does not export a default function.");`
        : ""
    }
  }
}`;
        }
        return "export const setup = () => {};";
      }
    }
  };
}

function configEnvironmentPlugin(): Plugin {
  return {
    name: "@astrojs/vue:config-environment",
    configEnvironment(environmentName, _options) {
      const environmentOptions: EnvironmentOptions = {
        optimizeDeps: {}
      };

      if (environmentName === "client") {
        environmentOptions.optimizeDeps!.include = ["lune-js"];
      }

      return environmentOptions;
    }
  };
}

export default function createPlugin(options?: Options): AstroIntegration {
  return {
    name: NAME,
    hooks: {
      "astro:config:setup": ({ injectScript, updateConfig }) => {
        // This gets injected into the user's page, so the import will pull
        // from the project's version of Lune.js in their package.json.
        injectScript(
          "page",
          `import * as Lune from "lune-js";
import { setup } from "virtual:${NAME}/entrypoint";
const app = Lune.createApp();
setup(app);
window.Lune = Lune;
document.addEventListener("DOMContentLoaded", () => app.mount());`
        );
        updateConfig({
          vite: {
            plugins: [virtualEntrypoint(options), configEnvironmentPlugin()]
          }
        });
      }
    }
  };
}
