import { defineConfig } from "/home/yoshi/git/busnes.app/kynotes-server/.claude/worktrees/fleet-appearance/web/node_modules/@playwright/test";
export default defineConfig({ testDir: ".", testMatch: "*.e2e.ts", timeout: 180_000, workers: 1, retries: 0, outputDir: "/tmp/claude-fleet-review-v2/notes-extra/out",
  use: { baseURL: "http://127.0.0.1:18080", browserName: "chromium" },
  webServer: { command: "bash e2e/server.sh", cwd: "/home/yoshi/git/busnes.app/kynotes-server/.claude/worktrees/fleet-appearance/web", url: "http://127.0.0.1:18080/readyz", timeout: 180_000, reuseExistingServer: false, gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 } } });
