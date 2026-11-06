import { expect, test } from "@playwright/test";

test.describe("mobile", () => {
  test("menu opens, navigates and closes; no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await toggle.click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /Courts/ }).click();
    await expect(page).toHaveURL(/\/courts$/);
    await expect(menu).toBeHidden();
    for (const p of ["/", "/courts", "/courts/raffles-bali", "/journal/tennis-escape-score-how-we-rate", "/guides/bali-tennis-escape-guide", "/destinations/bali"]) {
      await page.goto(p);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, p).toBeLessThanOrEqual(1);
    }
  });

  test("courts list/map toggle", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.getByTestId("venue-results")).toBeVisible();
    await page.getByRole("link", { name: "Map", exact: true }).click();
    await expect(page).toHaveURL(/view=map/);
    await expect(page.getByTestId("venue-map")).toBeVisible();
    await expect(page.getByTestId("venue-results")).toBeHidden();
  });
});
