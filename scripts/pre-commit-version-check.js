#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Compares two semantic version strings
 * @param {string} version1 - First version to compare
 * @param {string} version2 - Second version to compare
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }

  return 0;
}

/**
 * Extracts version from package.json
 */
function getPackageVersion() {
  const packagePath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  return packageJson.version;
}

/**
 * Extracts version from src/version.ts
 */
function getExportedVersion() {
  const versionPath = path.join(__dirname, "../src/version.ts");

  if (!fs.existsSync(versionPath)) {
    return null;
  }

  const content = fs.readFileSync(versionPath, "utf8");
  const match = content.match(/export const VERSION = "([^"]+)";/);
  return match ? match[1] : null;
}

/**
 * Main function to check versions and update if needed
 */
function main() {
  try {
    const packageVersion = getPackageVersion();
    const exportedVersion = getExportedVersion();

    console.log(`Package version: ${packageVersion}`);
    console.log(`Exported version: ${exportedVersion || "not found"}`);

    if (!exportedVersion) {
      console.log(
        "No exported version found, running generate-version script...",
      );
      execSync("node scripts/generate-version.js", { stdio: "inherit" });
      console.log("✅ Version file generated successfully");
      return;
    }

    const comparison = compareVersions(packageVersion, exportedVersion);

    if (comparison > 0) {
      console.log(
        `📦 Package version (${packageVersion}) is higher than exported version (${exportedVersion})`,
      );
      console.log("🔄 Running generate-version script to sync versions...");
      execSync("node scripts/generate-version.js", { stdio: "inherit" });
      console.log("✅ Versions synchronized successfully");
    } else if (comparison < 0) {
      console.log(
        `⚠️  Package version (${packageVersion}) is lower than exported version (${exportedVersion})`,
      );
      console.log(
        "This might indicate the package.json version needs to be updated",
      );
    } else {
      console.log("✅ Versions are already in sync");
    }
  } catch (error) {
    console.error("❌ Error during version check:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { compareVersions, getPackageVersion, getExportedVersion };
