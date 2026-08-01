import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Retrieving pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(`${baseUrl}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response.status).toBe(201);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
      test("For the second time", async () => {
        const response = await fetch(`${baseUrl}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(0);
      });
    });
  });
});

async function cleanDatabase() {
  await database.query({
    text: "drop schema public cascade; create schema public;",
  });
}
