import pool from "../src/app/utils/db";

async function main() {
  const client = await pool.connect();
  try {
    console.log("Cleanup: Dropping old tables...");
    await client.query("DROP TABLE IF EXISTS chunks CASCADE;");
    await client.query("DROP TABLE IF EXISTS documents CASCADE;");
    console.log("Cleanup done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
  }
}

main();
