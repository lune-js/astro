import type { App } from "lune-js";

export default (app: App) => {
  app.use({
    install: (app) => {
      app.directive("log", ({ exp }) => {
        console.log(exp);
      });
    }
  });
};
