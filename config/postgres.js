const { Client } = require("pg");
const { Client: SSHClient } = require("ssh2");
const fs = require("fs");
const net = require("net");
require("dotenv").config();

// SSH Configuration
const sshConfig = {
    host: process.env.SSH_HOST,
    port: 22,
    username: process.env.SSH_USER,
    //BUG: When this is hosted online, the key path wont work because the key is only stored locally. Will explore fixes later
    privateKey: fs.readFileSync(process.env.SSH_KEY_PATH),
};

// Database Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432,
};

async function connectWithTunnel() {
    const sshClient = new SSHClient();

    return new Promise((resolve, reject) => {
        let server;

        sshClient.on("ready", () => {
            console.log("SSH tunnel established");

            server = net.createServer((localSocket) => {
                sshClient.forwardOut(
                    "127.0.0.1",
                    0,
                    dbConfig.host,
                    dbConfig.port,
                    (err, sshStream) => {
                        if (err) {
                            console.error("SSH forward error:", err);
                            localSocket.end();
                            return;
                        }

                        localSocket.pipe(sshStream).pipe(localSocket);

                        sshStream.on("close", () => {
                            localSocket.end();
                        });

                        localSocket.on("close", () => {
                            sshStream.close();
                        });

                        sshStream.on("error", (err) => {
                            console.error("SSH stream error:", err);
                            localSocket.end();
                        });
                    }
                );
            });

            server.listen(0, "127.0.0.1", () => {
                const localPort = server.address().port;
                console.log(`Local server listening on port ${localPort}`);

                // Create PostgreSQL client with SSL
                const pgClient = new Client({
                    user: dbConfig.user,
                    password: dbConfig.password,
                    database: dbConfig.database,
                    host: "127.0.0.1",
                    port: localPort,
                    ssl: {
                        rejectUnauthorized: false, // For RDS, we often need this
                    },
                });

                pgClient.connect((err) => {
                    if (err) {
                        console.error("PostgreSQL connection error:", err);
                        server.close();
                        sshClient.end();
                        reject(err);
                        return;
                    }

                    console.log(
                        "Connected to PostgreSQL through SSH tunnel with SSL"
                    );
                    resolve({
                        pgClient,
                        sshClient,
                        server,
                        cleanup: () => {
                            console.log("Cleaning up connections...");
                            pgClient.end();
                            server.close();
                            sshClient.end();
                        },
                    });
                });
            });

            server.on("error", (err) => {
                console.error("Local server error:", err);
                sshClient.end();
                reject(err);
            });
        });

        sshClient.on("error", (err) => {
            console.error("SSH connection error:", err);
            if (server) server.close();
            reject(err);
        });

        sshClient.connect(sshConfig);
    });
}

module.exports = { connectWithTunnel };
