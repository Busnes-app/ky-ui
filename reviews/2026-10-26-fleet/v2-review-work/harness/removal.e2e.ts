import { expect, test } from "/home/yoshi/git/busnes.app/kynotes-server/.claude/worktrees/fleet-appearance/web/node_modules/@playwright/test";
import { adminConsole, OWNER, person, signIn } from "/home/yoshi/git/busnes.app/kynotes-server/.claude/worktrees/fleet-appearance/web/e2e/people";
// Reviewer-owned: removal and clear() in another tab must return the checked card to Match system.
test("Appearance follows key removal and clear() from another tab", async ({ browser }) => {
  const admin = await person(browser); const owner = await person(browser);
  try {
    await adminConsole(admin.page);
    await signIn(owner.page, OWNER.username, OWNER.password);
    await owner.page.getByRole("button", { name: "Settings" }).click();
    const card = (id: string) => owner.page.locator(`.ky-appearance-radio[value="${id}"]`);
    await card("ocean").check();
    await expect(card("ocean")).toBeChecked();
    const saved = await owner.page.evaluate(() => localStorage.getItem("kynotes-theme"));
    const other = await owner.page.context().newPage();
    await other.goto("/readyz");
    await other.evaluate(() => localStorage.removeItem("kynotes-theme"));
    await expect(card("system")).toBeChecked();
    await other.evaluate(() => localStorage.setItem("kynotes-theme", "Cliffs"));
    await expect(card("white-cliffs")).toBeChecked();
    await other.evaluate(() => localStorage.clear());
    await expect(card("system")).toBeChecked();
    console.log("saved-format", JSON.stringify(saved));
  } finally { await admin.page.context().close(); await owner.page.context().close(); }
});
