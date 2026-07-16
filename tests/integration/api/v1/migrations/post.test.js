import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

async function cleanDatabase() {
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
