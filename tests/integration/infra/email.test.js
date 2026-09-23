import email from "infra/email";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices;
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "Test <test@caduceusapp.com.br>",
      to: "contato@example.com.br",
      subject: "Primeiro email",
      text: "Primeiro email enviado.",
    });

    await email.send({
      from: "Test <test@caduceusapp.com.br>",
      to: "contato@example.com.br",
      subject: "Ultimo email",
      text: "Ultimo email enviado.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@caduceusapp.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@example.com.br>");
    expect(lastEmail.subject).toBe("Ultimo email");
    expect(lastEmail.text).toBe("Ultimo email enviado.\n");
  });
});
