const { connectWithTunnel } = require("../config/postgres");

async function main() {
    let connection;
    //Create connection to thedatabase
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;
        console.log();
    } catch (err) {
        console.error("Connection error:", err);
    }

    console.log("Mock code");
    console.log("Do some things");
    console.log("Search JSON");
    console.log("Parse JSON");
    console.log("Save to database");

    //Close connection to the database
    if (connection) {
        console.log();
        const { cleanup } = connection;
        cleanup();
        console.log("Connection closed");
    }
}

main();
