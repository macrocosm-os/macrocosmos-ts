import * as path from "path";
import * as fs from "fs";

// Package name for the SDK
export const CLIENT_NAME = "macrocosmos-ts-sdk";

// Package version from package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
const packageJson = JSON.parse(packageJsonContent) as { version: string };
export const VERSION = packageJson.version;

export const BASE_URL =
  process.env.MACROCOSMOS_BASE_URL || "constellation.api.cloud.macrocosmos.ai";
export const APEX_API_KEY =
  process.env.APEX_API_KEY || process.env.MACROCOSMOS_API_KEY;
export const GRAVITY_API_KEY =
  process.env.GRAVITY_API_KEY || process.env.MACROCOSMOS_API_KEY;
