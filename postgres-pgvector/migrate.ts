import { initDb } from "../src/app/utils/db";

async function main() {
  try {
    await initDb();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
