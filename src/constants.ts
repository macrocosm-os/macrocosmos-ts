import * as path from "path";
import * as fs from "fs";

// Package name for the SDK
export const CLIENT_NAME = "macrocosmos-ts-sdk";

// Package version from package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
export const VERSION = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
).version;
export const BASE_URL =
  process.env.MACROCOSMOS_BASE_URL || "constellation.api.cloud.macrocosmos.ai";
export const APEX_API_KEY =
  process.env.APEX_API_KEY || process.env.MACROCOSMOS_API_KEY;
export const GRAVITY_API_KEY =
  process.env.GRAVITY_API_KEY || process.env.MACROCOSMOS_API_KEY;
