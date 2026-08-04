import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retriving current system status", async () => {
      const response = await fetch(`${baseUrl}/api/v1/status`);
      expect(response.status).toBe(200);

      const data = await response.json();
      const parsedUpdatedAt = new Date(data.updated_At).toISOString();
      expect(data.updated_At).toBe(parsedUpdatedAt);

      expect(data.dependencies.database.version).toEqual("16.0");
      expect(data.dependencies.database.max_connections).toEqual("100");
      expect(data.dependencies.database.current_connections).toEqual(1);
    });
  });
});
