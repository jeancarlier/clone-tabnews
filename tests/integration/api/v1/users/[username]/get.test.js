import orchestrator from "tests/orchestrator.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("with exact case match", async () => {
      await orchestrator.createUser({
        username: "ExactMatch",
        email: "exact.match@example.com",
        password: "password123",
      });

      const response2 = await fetch(`${baseUrl}/api/v1/users/ExactMatch`, {
        method: "GET",
      });
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "ExactMatch",
        email: "exact.match@example.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
    });

    test("with case mismatch", async () => {
      await orchestrator.createUser({
        username: "DifferentMatch",
        email: "differentMatch@example.com",
        password: "password123",
      });

      const response2 = await fetch(`${baseUrl}/api/v1/users/differentmatch`);
      expect(response2.status).toBe(200);
    });

    test("with non existent username", async () => {
      const response = await fetch(`${baseUrl}/api/v1/users/InexistentUser`);
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado no sistema.",
        action: "Verifique o nome do usuario e tente novamente.",
        statusCode: 404,
      });
    });
  });
});
