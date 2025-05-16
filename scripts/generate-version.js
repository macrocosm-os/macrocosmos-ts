const { version } = require("../package.json");
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "../src/version.ts");
fs.writeFileSync(outPath, `export const VERSION = "${version}";\n`);
