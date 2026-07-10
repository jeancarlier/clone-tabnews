import database from "infra/database.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await cleanDatabase();
});

async function cleanDatabase() {
  console.log({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.NODE_ENV === "production" ? true : false,
  });
  await database.query({
    text: "drop schema public cascade; create schema public;",
  });
}

test("POST /api/v1/migrations should return status 200", async () => {
  const response = await fetch(`${baseUrl}/api/v1/migrations`, {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);

  const migrationCount = await database.query({
    text: "SELECT COUNT(*)::int FROM pgmigrations",
  });
  expect(migrationCount.rows[0].count).toBe(responseBody.length);
});
