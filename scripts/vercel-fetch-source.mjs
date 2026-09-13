import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

// Manual MCP deploys may ship only bootstrap files; hydrate full tree from main.
if (existsSync("app/page.tsx") && existsSync("lib/store.ts")) {
  process.exit(0);
}

execSync(
  "curl -fsSL https://github.com/sharadvc/tabtax/tarball/main | tar xz --strip-components=1",
  { stdio: "inherit" }
);
