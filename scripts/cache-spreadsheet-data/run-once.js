
const script = require("./cache-sheet.js");

async function main() {
    await script.setup();
    await script.task();
}

main();
