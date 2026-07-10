import database from "infra/database.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await cleanDatabase();
});

async function cleanDatabase() {
  await database.query({
    text: "drop schema public cascade; create schema public;",
  });
}

test("GET /api/v1/migrations should return status 200", async () => {
  const response = await fetch(`${baseUrl}/api/v1/migrations`);
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
