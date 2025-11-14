/**
 * @fileoverview Script to generate JSDoc documentation and optionally open it in a browser. Uses child_process to run JSDoc and readline to prompt the user.
 */

const { execSync } = require("child_process");
const readline = require("readline");

// Generate docs
console.log("Generating documentation...");
execSync("jsdoc -c ./config/jsdoc.json", { stdio: "inherit" });
console.log("Documentation generated successfully!\n");

// Prompt user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Do you want to open the docs? (y/n) ", (answer) => {
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        console.log("Opening docs...");
        execSync("open docs/index.html");
    } else {
        console.log("Docs not opened.");
    }
    rl.close();
});
