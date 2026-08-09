import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("with unique and valid data", async () => {
      await database.query({
        text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
        values: ["john_doe", "john.doe@example.com", "password123"],
      });
      const users = await database.query("SELECT * FROM users");
      console.log(users.rows);

      const response = await fetch(`${baseUrl}/api/v1/users`, {
        method: "POST",
      });
      expect(response.status).toBe(201);
    });
  });
});
