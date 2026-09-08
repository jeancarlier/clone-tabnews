import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("with unique `username`", async () => {
      const createdUser = await orchestrator.createUser({});

      const response = await fetch(
        `${baseUrl}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueusername2",
          }),
        },
      );
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se o seu usuário possui a feature update:user",
        message: "Você não possui permissão para executar esta ação",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("with nonexistent `username`", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${baseUrl}/api/v1/users/InexistentUser`, {
        method: "PATCH",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado no sistema.",
        action: "Verifique o nome do usuario e tente novamente.",
        statusCode: 404,
      });
    });

    test("with duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${baseUrl}/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username já esta sendo utilizado.",
        action: "Por favor, utilize outro username.",
        statusCode: 400,
      });
    });

    test("with `userB` targetting `userA`", async () => {
      await orchestrator.createUser({
        username: "userA",
      });

      const createdUserB = await orchestrator.createUser({
        username: "userB",
      });

      const activatedUserB = await orchestrator.activateUser(createdUserB);
      const sessionObjectB = await orchestrator.createSession(
        activatedUserB.id,
      );

      const response = await fetch(`${baseUrl}/api/v1/users/userA`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObjectB.token}`,
        },
        body: JSON.stringify({
          username: "userC",
        }),
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário.",
        message: "Você não tem permissão para atualizar outro usuário.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });

    test("with duplicated `email`", async () => {
      await orchestrator.createUser({
        email: "email1@example.com",
      });
      const createdUser2 = await orchestrator.createUser({
        email: "email2@example.com",
      });

      const activatedUser = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${baseUrl}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "email1@example.com",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email já esta sendo utilizado.",
        action: "Por favor, utilize outro email.",
        statusCode: 400,
      });
    });

    test("with unique `username`", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${baseUrl}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueusername2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id, // The ID will be generated by the database, so we can't assert its exact value
        username: "uniqueusername2",
        email: createdUser.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at, // The created_at timestamp will be generated by the database, so we can't assert its exact value
        updated_at: responseBody.updated_at, // The updated_at timestamp will be generated by the database, so we can't assert its exact value
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with unique `email`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueemail1@example.com",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${baseUrl}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueemail2@example.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id, // The ID will be generated by the database, so we can't assert its exact value
        username: createdUser.username,
        email: "uniqueemail2@example.com",
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at, // The created_at timestamp will be generated by the database, so we can't assert its exact value
        updated_at: responseBody.updated_at, // The updated_at timestamp will be generated by the database, so we can't assert its exact value
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with new `password`", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${baseUrl}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id, // The ID will be generated by the database, so we can't assert its exact value
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at, // The created_at timestamp will be generated by the database, so we can't assert its exact value
        updated_at: responseBody.updated_at, // The updated_at timestamp will be generated by the database, so we can't assert its exact value
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });

  describe("Privileged user", () => {
    test("with `update:user:others` targetting `defaultUser`", async () => {
      const privilegedUser = await orchestrator.createUser();
      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);
      const privilegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);

      const defaultUser = await orchestrator.createUser();

      const response = await fetch(
        `${baseUrl}/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${privilegedUserSession.token}`,
          },
          body: JSON.stringify({
            username: "AlteradoPorPrivilegiado",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "AlteradoPorPrivilegiado",
        email: defaultUser.email,
        password: defaultUser.password,
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
