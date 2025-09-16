import { test, expect } from "@playwright/test";

test.describe("Smoke Flows", () => {
  test("Anmeldung, Urlaub, Upload, PDF", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Anmeldung" })).toBeVisible();

    await page.fill("input[name=\"username\"]", "admin");
    await page.fill("input[name=\"password\"]", "Passwort123!");
    await Promise.all([page.waitForNavigation(), page.click("button:has-text(\"Anmelden\")")]);

    await expect(page.getByText("Bevorstehende Abwesenheiten")).toBeVisible();

    await page.goto("/urlaubskalender");
    await expect(page.getByText("Neuen Urlaub beantragen")).toBeVisible();

    await page.fill("input[name=\"startDate\"]", "2099-01-01");
    await page.fill("input[name=\"endDate\"]", "2099-01-05");
    await page.selectOption("select[name=\"type\"]", "urlaub");
    await page.fill("textarea[name=\"comment\"]", "E2E Test");
    await page.click("button:has-text(\"Antrag senden\")");
    await expect(page.getByText("Urlaub angelegt")).toBeVisible();

    await page.goto("/krankmeldungen");
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.click("input[type=file]")
    ]);
    await fileChooser.setFiles("tests/fixtures/krankmeldung.pdf");
    await page.fill("textarea", "E2E Upload");
    await page.click("button:has-text(\"Hochladen\")");
    await expect(page.getByText("Upload erfolgreich")).toBeVisible();

    await page.goto("/admin");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("a[href^='/api/admin/profiles/']")
    ]);
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
  });
});
