import { test, expect } from "@playwright/test";

test.describe("Lune is working", () => {
  test("Basics", async ({ page }) => {
    await page.goto("/basic");

    const el = page.locator("#count");
    const incrementButton = page.locator("#increment");
    const decrementButton = page.locator("#decrement");

    await expect(el).toHaveText("1");

    await incrementButton.click();
    await expect(el).toHaveText("2");

    await incrementButton.click();
    await expect(el).toHaveText("3");

    await decrementButton.click();
    await expect(el).toHaveText("2");

    await decrementButton.click();
    await expect(el).toHaveText("1");
  });

  test("Directive", async ({ page }) => {
    const messagePromise = page.waitForEvent("console", (msg) => msg.text().includes("inside scope"));

    await page.goto("/directive");

    const el = page.locator("#message");
    await expect(el).toHaveText("Hello, Astro!");

    const message = await messagePromise;
    test.expect(message.text()).toContain("inside scope");
  });
});
