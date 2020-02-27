
const script = require("./cache-sheet.js");

const UPLOAD_INTERVAL_SEC = 60 * 5;

async function main() {
    await script.setup();

    console.log("Running task on start...");
    await script.task();

    console.log("Creating task...");
    setInterval(script.task, UPLOAD_INTERVAL_SEC * 1000.0);
}

main();
