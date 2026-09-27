import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Target directories containing images to convert
const TARGET_DIRS = [
  path.join(ROOT_DIR, "public"),
  path.join(ROOT_DIR, "asset"),
  path.join(ROOT_DIR, "src", "assets"),
];

// Target code directories to update image references
const CODE_DIRS = [
  path.join(ROOT_DIR, "app"),
  path.join(ROOT_DIR, "src"),
];

const SUPPORTED_EXTS = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tiff"]);
const IGNORED_DIRS = new Set(["node_modules", ".next", "dist", ".git", "cache", "artifacts"]);

/**
 * Format bytes to human readable string (KB, MB)
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Recursively find all image files
 */
function findImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        findImageFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

/**
 * Recursively find all source code files (.jsx, .js, .tsx, .ts, .css, .html)
 */
function findCodeFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        findCodeFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".md"]).has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

/**
 * Convert a single image to WebP using sharp
 */
async function convertImageToWebp(filePath, options = {}) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const webpPath = path.join(dir, `${baseName}.webp`);

  const originalStats = fs.statSync(filePath);
  const originalSize = originalStats.size;

  try {
    // Sharp optimization configuration
    const isJpeg = ext.toLowerCase() === ".jpeg" || ext.toLowerCase() === ".jpg";
    await sharp(filePath)
      .webp({
        quality: isJpeg ? 80 : (options.quality || 82),
        effort: 6, // maximum compression effort
        lossless: false,
      })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    const savedBytes = originalSize - webpSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    return {
      success: true,
      originalPath: filePath,
      webpPath,
      baseName,
      ext,
      originalSize,
      webpSize,
      savedBytes,
      savedPercent,
    };
  } catch (err) {
    return {
      success: false,
      originalPath: filePath,
      error: err.message,
    };
  }
}

/**
 * Update code references to point to .webp
 */
function updateCodeReferences(convertedList) {
  const codeFiles = [];
  for (const dir of CODE_DIRS) {
    findCodeFiles(dir, codeFiles);
  }

  let totalReplacements = 0;
  const modifiedFiles = new Set();

  for (const codeFile of codeFiles) {
    let content = fs.readFileSync(codeFile, "utf-8");
    let fileChanged = false;

    for (const item of convertedList) {
      if (!item.success) continue;

      // Match patterns like: "/logo.png" -> "/logo.webp", "cool-pose.png" -> "cool-pose.webp"
      const targetPattern = new RegExp(`(?<=['"\`\\/\\s])${escapeRegExp(item.baseName)}${escapeRegExp(item.ext)}(?=['"\`\\?\\s])`, "g");

      if (targetPattern.test(content)) {
        content = content.replace(targetPattern, `${item.baseName}.webp`);
        fileChanged = true;
        totalReplacements++;
      }
    }

    if (fileChanged) {
      fs.writeFileSync(codeFile, content, "utf-8");
      modifiedFiles.add(path.relative(ROOT_DIR, codeFile));
    }
  }

  return { totalReplacements, modifiedFiles: Array.from(modifiedFiles) };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Main Execution Function
 */
async function main() {
  console.log("===============================================================");
  console.log("🖼️  TRUST LESSON — UNIVERSAL WEBP IMAGE CONVERTER & OPTIMIZER");
  console.log("===============================================================\n");

  const shouldUpdateCode = process.argv.includes("--update-code");

  // 1. Discover all images
  let allImages = [];
  for (const dir of TARGET_DIRS) {
    allImages = allImages.concat(findImageFiles(dir));
  }

  // Remove duplicates
  allImages = Array.from(new Set(allImages));

  if (allImages.length === 0) {
    console.log("ℹ️  No images (.png, .jpg, .jpeg) found to convert.");
    return;
  }

  console.log(`🔍 Found ${allImages.length} images across project folders.`);
  console.log("⚡ Starting high-efficiency WebP compression...\n");

  let totalOriginal = 0;
  let totalWebp = 0;
  const results = [];

  for (const img of allImages) {
    const relPath = path.relative(ROOT_DIR, img);
    process.stdout.write(`   Converting: ${relPath}... `);

    const res = await convertImageToWebp(img, { quality: 85 });
    results.push(res);

    if (res.success) {
      totalOriginal += res.originalSize;
      totalWebp += res.webpSize;
      const indicator = res.savedBytes >= 0 ? `-${res.savedPercent}%` : `+${Math.abs(res.savedPercent)}%`;
      console.log(`✓ [${formatBytes(res.originalSize)} -> ${formatBytes(res.webpSize)} (${indicator})]`);
    } else {
      console.log(`❌ FAILED: ${res.error}`);
    }
  }

  const netSavedBytes = totalOriginal - totalWebp;
  const netSavedPercent = ((netSavedBytes / totalOriginal) * 100).toFixed(1);

  console.log("\n===============================================================");
  console.log("📊 CONVERSION SUMMARY STATISTICS");
  console.log("===============================================================");
  console.log(`   Total Images Processed : ${allImages.length}`);
  console.log(`   Original Total Size    : ${formatBytes(totalOriginal)}`);
  console.log(`   WebP Total Size        : ${formatBytes(totalWebp)}`);
  console.log(`   Bandwidth Saved        : ${formatBytes(netSavedBytes)} (${netSavedPercent}% reduction!)`);
  console.log("===============================================================\n");

  // 2. Optionally update code references
  if (shouldUpdateCode) {
    console.log("🔄 Updating code references in app/ and src/ to use .webp...");
    const { totalReplacements, modifiedFiles } = updateCodeReferences(results);
    console.log(`   ✓ Replaced ${totalReplacements} image path occurrences across ${modifiedFiles.length} files:`);
    modifiedFiles.forEach((file) => console.log(`     - ${file}`));
    console.log("\n✨ Code references updated successfully!");
  } else {
    console.log("💡 Tip: To automatically update image references in JSX/CSS/JS to .webp,");
    console.log("   run with the flag: node scripts/convertToWebp.js --update-code\n");
  }

  console.log("🎉 All images are ready in high-performance WebP format!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
