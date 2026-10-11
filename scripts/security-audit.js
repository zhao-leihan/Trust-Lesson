import fs from "fs";
import path from "path";

const SENSITIVE_PATTERNS = [
  { name: "Cloudflare Turnstile Secret", regex: /0x4AAAAAA[a-zA-Z0-9_-]+/g },
  { name: "Resend API Key", regex: /re_[a-zA-Z0-9]{20,}/g },
  { name: "Private Key / Hex Token", regex: /['"](?:0x)?[0-9a-fA-F]{64}['"]/g },
  { name: "AWS / S3 Key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Hardcoded Secret Token", regex: /(?:secret|private[_-]?key|api[_-]?key)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{16,}['"]/gi },
];

const IGNORED_PATHS = [
  ".env",
  ".env.local",
  "node_modules",
  ".git",
  ".next",
  "artifacts",
  "out",
  "cache",
  "dist",
  "build",
  "package-lock.json",
  "yarn.lock",
  ".env.example",
  ".env.local.example",
  "foundry.toml",
  "scripts/security-audit.js",
  "deployments-sepolia.json",
  "deployments-mainnet.json",
];

const WHITELIST = [
  "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e", // Schema UID
  "0xf9bb02c35522b0fa28315b0cb6fff59515ade1c9003c0e3a08d11571149bcbab", // Arbitrum Sepolia createSession tx
  "0xe1df5c2964011b95ac9b61b6127894162d8c5a9e1c0be51a18c11cd3b721974e", // Arbitrum Sepolia releaseEscrow tx
  "0x0000000000000000000000000000000000000000000000000000000000000000", // Zero hash
  "1x00000000000000000000AA", // Cloudflare Turnstile public testing sitekey
];

const findings = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");

    if (IGNORED_PATHS.some((ignored) => relPath.startsWith(ignored) || relPath === ignored)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(js|jsx|ts|tsx|json|mjs|env.*)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        // Skip comment-only documentation lines
        if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("#")) {
          // But check if it has a hardcoded key in comment
          if (!/0x4AAAAAA|re_[a-zA-Z0-9]{20,}/.test(line)) return;
        }

        for (const pattern of SENSITIVE_PATTERNS) {
          const matches = line.match(pattern.regex);
          if (matches) {
            for (const match of matches) {
              const cleaned = match.replace(/['"]/g, "");
              if (WHITELIST.includes(cleaned)) continue;
              if (line.includes(`process.env.`)) {
                // If it's a fallback string like process.env.KEY || "secret", that IS exposed!
                if (!line.includes(`|| "${cleaned}"`) && !line.includes(`|| '${cleaned}'`)) {
                  continue;
                }
              }

              findings.push({
                file: relPath,
                line: idx + 1,
                pattern: pattern.name,
                snippet: line.trim(),
                match: cleaned,
              });
            }
          }
        }
      });
    }
  }
}

scanDir(process.cwd());

console.log(`Scan completed. Found ${findings.length} findings:`);
findings.forEach((f) => {
  console.log(`\n[ALERT: ${f.pattern}] in ${f.file}:${f.line}`);
  console.log(`  Code: ${f.snippet}`);
});

if (findings.length > 0) {
  process.exitCode = 1;
}
