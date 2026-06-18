const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "../../client/dist");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(distDir)) {
  throw new Error("Client build failed: client/dist not found. Run from repo root: npm run build");
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.cpSync(distDir, publicDir, { recursive: true });
console.log("Frontend copied to server/public");
