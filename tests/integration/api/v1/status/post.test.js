import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retriving current system status", async () => {
      const response = await fetch(`${baseUrl}/api/v1/status`, {
        method: "POST",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        action:
          "Verifique se o método HTTP utilizado é valido para este endpoint.",
        statusCode: 405,
      });
    });
  });
});
