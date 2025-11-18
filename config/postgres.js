import { Client as SSHClient } from "ssh2";
import pg from "pg";
import { readFileSync } from "fs";
import net from "net";

let sshClient = null;
let localPort = null;
let pool = null;

/**
 * Create SSH tunnel and local port forward
 * @returns {Promise<number>} Local port number
 */
async function createTunnel() {
    if (localPort) return localPort;

    return new Promise((resolve, reject) => {
        sshClient = new SSHClient();

        // Create a local server that will forward to the remote DB
        const server = net.createServer((clientSocket) => {
            sshClient.forwardOut(
                clientSocket.remoteAddress,
                clientSocket.remotePort,
                process.env.DB_HOST,
                parseInt(process.env.DB_PORT || 5432),
                (err, stream) => {
                    if (err) {
                        console.error("SSH forward error:", err);
                        clientSocket.end();
                        return;
                    }
                    clientSocket.pipe(stream).pipe(clientSocket);
                }
            );
        });

        sshClient.on("ready", () => {
            console.log("SSH tunnel established");

            // Listen on a random local port
            server.listen(0, "127.0.0.1", () => {
                localPort = server.address().port;
                console.log(`Local server listening on port ${localPort}`);
                resolve(localPort);
            });
        });

        sshClient.on("error", (err) => {
            console.error("SSH connection error:", err);
            reject(err);
        });

        sshClient.connect({
            host: process.env.SSH_HOST,
            port: parseInt(process.env.SSH_PORT || 22),
            username: process.env.SSH_USER,
            privateKey: readFileSync(process.env.SSH_KEY_PATH),
        });
    });
}

/**
 * Get connection pool (creates tunnel + pool on first call, reuses thereafter)
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
export async function getPool() {
    if (pool) return pool;

    // Create SSH tunnel first
    const port = await createTunnel();

    // Create pool connecting to local port (which tunnels to remote DB)
    pool = new pg.Pool({
        host: "127.0.0.1",
        port: port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
    });

    pool.on("error", (err) => {
        console.error("Pool error:", err);
    });

    console.log("Connected to PostgreSQL through SSH tunnel with SSL");
    return pool;
}

/**
 * Close database connection gracefully
 */
export async function closeDatabase() {
    if (pool) {
        console.log("Closing database pool...");
        await pool.end();
        pool = null;
    }
    if (sshClient) {
        console.log("Closing SSH tunnel...");
        sshClient.end();
        sshClient = null;
    }
    console.log("Database connection closed");
}
