const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "../../client");
const publicDir = path.join(__dirname, "../public");
const distDir = path.join(clientDir, "dist");

console.log("Building frontend...");
execSync("npm install --legacy-peer-deps", { cwd: clientDir, stdio: "inherit", shell: true });
execSync("npm run build", { cwd: clientDir, stdio: "inherit", shell: true });

if (!fs.existsSync(distDir)) {
  throw new Error("Client build failed: dist/ folder not found");
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.cpSync(distDir, publicDir, { recursive: true });
console.log("Frontend copied to server/public");
