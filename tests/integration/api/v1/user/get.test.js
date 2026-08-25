import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("with valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      console.log(cacheControl);
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSession = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSession.expires_at > sessionObject.expires_at).toBe(true);
      expect(renewedSession.updated_at > sessionObject.updated_at).toBe(true);

      // Set-cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISENCONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("with nonexistent session", async () => {
      const nonexistentToken =
        "d60546b89f9d22ba61a435bb6f4e890190b3ddf831475aed6743aca264759c4aa2ba65110556500f1d64d69a260d6d88";

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuario não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        statusCode: 401,
      });
    });

    test("with expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISENCONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuario não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        statusCode: 401,
      });
    });

    test("with almost expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISENCONDS + 60000), // One minute to expire
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithAlmostExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();
      const response = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      console.log(cacheControl);
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      // Session renewal assertions
      const renewedSession = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSession.expires_at > sessionObject.expires_at).toBe(true);
      expect(renewedSession.updated_at > sessionObject.updated_at).toBe(true);
      expect(
        renewedSession.expires_at - sessionObject.expires_at >=
          session.EXPIRATION_IN_MILLISENCONDS - 60000,
      ).toBe(true);

      // Set-cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISENCONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
