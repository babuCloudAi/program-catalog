const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Please specify a script to run: 'department', 'program', 'programspdf', or 'skillMapping'.");
    process.exit(1);
}

const scriptName = args[0];

try {
    // Dynamically require the specified script
    require(`./src/scrapers/${scriptName}.js`);
    console.log(`${scriptName}.js executed successfully.`);
} catch (error) {
    console.error(`Error: Could not find or execute './src/scrapers/${scriptName}.js'.`);
    console.error(error.message);
    process.exit(1);
}
