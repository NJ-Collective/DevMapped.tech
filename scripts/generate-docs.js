/**
 * @fileoverview Script to generate JSDoc documentation and optionally open it in a browser.
 * @module generate-docs
 */

import { execSync } from "child_process";
import { createInterface } from "readline";

// Generate docs
console.log("Generating documentation...");
/**
 * Executes the JSDoc command to generate documentation from the configuration file.
 * @throws {Error} If the JSDoc command fails or the configuration file is not found.
 */
execSync("jsdoc -c ./config/jsdoc.json", { stdio: "inherit" });
console.log("Documentation generated successfully!\n");

// Prompt user
/**
 * Creates a readline interface for user input/output interaction.
 * @type {readline.Interface}
 */
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Prompts the user to open the generated documentation in their default browser.
 * @param {string} answer - The user's response to the prompt.
 */
rl.question("Do you want to open the docs? (y/n) ", (answer) => {
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        console.log("Opening docs...");
        /**
         * Opens the generated documentation index.html file in the default browser using the macOS 'open' command.
         * @throws {Error} If the file doesn't exist or the open command fails.
         */
        execSync("open docs/index.html");
    } else {
        console.log("Docs not opened.");
    }
    rl.close();
});
