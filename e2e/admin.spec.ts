import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("editor@courtscape.example");
  await page.getByLabel("Password").fill("e2e-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

test.describe("admin authentication", () => {
  test("protects admin pages and actions", async ({ page, request }) => {
    await page.goto("/admin/venues");
    await expect(page).toHaveURL(/\/admin\/login$/);
    expect((await request.get("/api/admin/export/subscribers")).status()).toBe(401);
  });

  test("rejects wrong credentials and forged cookies", async ({ page, context }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("editor@courtscape.example");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    await context.addCookies([{ name: "cs_admin", value: "eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OTk5OX0.forged", url: "http://localhost:3200" }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("signs in and out", async ({ page }) => {
    await login(page);
    await expect(page.getByText("TEST MODE — no real payments")).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin content management", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("create, publish and delete a destination", async ({ page }) => {
    await page.goto("/admin/destinations/new");
    await page.getByRole("button", { name: "Create destination" }).click();
    await expect(page.getByText("Name is required.")).toBeVisible();
    await page.locator("#fld-name").fill("Sumba");
    await page.locator("#fld-country").fill("Indonesia");
    await page.locator("#fld-tagline").fill("Savannah, surf and quiet courts.");
    await page.locator("#fld-published").check();
    await page.getByRole("button", { name: "Create destination" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/destinations/sumba");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sumba");
    await expect(page.getByText("Research in progress.")).toBeVisible();

    await page.goto("/admin/destinations?q=sumba");
    await page.getByRole("link", { name: "Sumba" }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Deleted.")).toBeVisible();
    expect((await page.request.get("/destinations/sumba")).status()).toBe(404);
  });

  test("add courts, a review and record verification on a venue", async ({ page }) => {
    await page.goto("/admin/venues?q=Ungasan");
    await page.getByRole("link", { name: "The Ungasan Clifftop Resort" }).click();
    await page.waitForURL(/\/admin\/venues\/[0-9a-f-]{36}$/);
    const venueUrl = page.url();

    // Cannot claim "personally reviewed" without a personal review
    await page.locator("#fld-verification_status").selectOption("personally_reviewed");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/Add and publish a personally-visited review/)).toBeVisible();

    // Add a court
    await page.goto(venueUrl);
    await page.getByRole("link", { name: "Add court" }).click();
    await page.locator("#fld-court_name").fill("Clifftop practice court");
    await page.locator("#fld-surface").selectOption("hard");
    await page.locator("#fld-court_count").fill("1");
    await page.getByRole("button", { name: "Create court" }).click();
    await expect(page.getByRole("link", { name: "Clifftop practice court" })).toBeVisible();

    // Scores without a personal visit are refused
    await page.getByRole("link", { name: "Add review" }).click();
    await page.locator("#fld-reviewer").fill("COURTSCAPE Editor");
    await page.locator("#fld-scenery_score").fill("9");
    await page.getByRole("button", { name: "Create review" }).click();
    await expect(page.getByText("Scores can only be recorded for a personal visit.")).toBeVisible();
    await page.locator("#fld-personally_visited").check();
    for (const [f, v] of [["tennis_quality_score", "8"], ["stay_experience_score", "9"], ["accessibility_score", "7"], ["family_experience_score", "8"]]) await page.locator(`#fld-${f}`).fill(v);
    await page.locator("#fld-review_date").fill("2026-11-01");
    await page.locator("#fld-published").check();
    await page.getByRole("button", { name: "Create review" }).click();
    await expect(page.getByRole("link", { name: "COURTSCAPE Editor" })).toBeVisible();

    // Record verification
    await page.getByRole("button", { name: "Verified with venue today" }).click();
    await expect(page.getByText("Verification recorded.")).toBeVisible();

    // Public page reflects score and verification
    await page.goto("/courts/the-ungasan-clifftop-resort");
    await expect(page.getByLabel("Tennis Escape Score 8.2 out of 10")).toBeVisible();
    await expect(page.getByTestId("verification-panel")).toContainText("Information verified with venue");
    await expect(page.getByText("Clifftop practice court")).toBeVisible();

    // And sorting by score puts it first
    await page.goto("/courts?sort=score");
    await expect(page.getByTestId("venue-results").getByRole("heading").first()).toHaveText("The Ungasan Clifftop Resort");
  });

  test("write and publish a journal article with a film", async ({ page }) => {
    await page.goto("/admin/articles/new");
    await page.locator("#fld-title").fill("Ten courts with a view");
    await page.locator("#fld-category").selectOption("Courts");
    await page.locator("#fld-excerpt").fill("A short test story.");
    await page.locator("#fld-body").fill("## First\n\nHello **world**.\n\n- one\n- two");
    await page.locator("#fld-published_at").fill("2026-11-05");
    await page.locator("#fld-published").check();
    await page.getByRole("button", { name: "Create article" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/journal/ten-courts-with-a-view");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ten courts with a view");
    await expect(page.locator("article strong", { hasText: "world" })).toBeVisible();

    await page.goto("/admin/videos/new");
    await page.locator("#fld-title").fill("Test film");
    await page.locator("#fld-youtube_video_id").fill("not a link");
    await page.getByRole("button", { name: "Create film" }).click();
    await expect(page.getByText(/Couldn't find a YouTube video ID/)).toBeVisible();
    await expect(page.locator("#fld-title")).toHaveValue("Test film"); // input survives validation errors
    await page.locator("#fld-youtube_video_id").fill("https://youtu.be/dQw4w9WgXcQ");
    await page.locator("#fld-published").check();
    await page.getByRole("button", { name: "Create film" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/films");
    await expect(page.getByRole("button", { name: "Play film: Test film" })).toBeVisible();
  });

  test("unpublish hides content publicly", async ({ page }) => {
    await page.goto("/admin/venues?q=Halekulani");
    await page.getByRole("button", { name: "Unpublish" }).click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
    expect((await page.request.get("/courts/halekulani-okinawa")).status()).toBe(404);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("button", { name: "Unpublish" })).toBeVisible();
    expect((await page.request.get("/courts/halekulani-okinawa")).status()).toBe(200);
  });

  test("purchases are listed and download tokens never shown", async ({ page }) => {
    await page.goto("/admin/purchases");
    await expect(page.getByRole("heading", { name: "Purchases" })).toBeVisible();
    expect(await page.content()).not.toContain("download_token_hash");
  });
});
