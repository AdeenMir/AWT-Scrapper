const { execSync } = require("child_process");
const path = require("path");

const clientDir = path.join(__dirname, "../../client");

console.log("Building frontend...");
execSync("npm install --legacy-peer-deps", { cwd: clientDir, stdio: "inherit", shell: true });
execSync("npm run build", { cwd: clientDir, stdio: "inherit", shell: true });
require("./copy-public");
