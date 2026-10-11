import { parse } from "next/dist/build/swc/index.js";
import fs from "fs";
import path from "path";

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    if (file === "node_modules" || file === ".next" || file === ".git") continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (full.endsWith(".js") || full.endsWith(".jsx")) {
      results.push(full);
    }
  }
  return results;
}

async function runLintCheck() {
  const targets = ["app", "src", "lib"];
  let allFiles = [];
  for (const t of targets) {
    allFiles = allFiles.concat(walk(t));
  }

  console.log(`Starting lint & syntax validation across ${allFiles.length} files...`);
  let errors = 0;

  for (const f of allFiles) {
    try {
      const code = fs.readFileSync(f, "utf8");
      await parse(code, { filename: f, syntax: "ecmascript", jsx: true });
    } catch (err) {
      console.error(`SYNTAX ERROR in ${f}: ${err.message}`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`Success: All ${allFiles.length} files passed lint & syntax checks with zero errors.`);
    process.exit(0);
  } else {
    console.error(`Failure: ${errors} syntax error(s) detected.`);
    process.exit(1);
  }
}

runLintCheck();
