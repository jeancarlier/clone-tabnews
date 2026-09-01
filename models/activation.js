import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 min

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
                INSERT INTO
                    user_activation_tokens (user_id, expires_at)
                VALUES
                    ($1, $2)
                RETURNING
                    *
                ;
            `,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Caduceus <contato@caduceusapp.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no Caduceus!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastron no Caduceus

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,

Equipe do Caduceus
        `,
  });
}

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(token) {
    const results = await database.query({
      text: `
        SELECT 
            *
        FROM
            user_activation_tokens
        WHERE
          id = $1 
          AND expires_at > NOW()
          AND used_at is NULL
        LIMIT
          1
        ;`,
      values: [token],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Token invalido ou expirado.",
        action:
          "Verifique se este token est'a correto e se a data de expiracão esteja ainda valida.",
      });
    }

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokeId) {
    const results = await database.query({
      text: `
                UPDATE 
                    user_activation_tokens
                SET
                    used_at = timezone('utc', now()), 
                    updated_at = timezone('utc', now())
                WHERE 
                    id = $1
                RETURNING
                    *
            ;`,
      values: [activationTokeId],
    });

    return results.rows[0];
  }
}

async function activateUserById(userId) {
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidByToken,
  markTokenAsUsed,
  activateUserById,
};

export default activation;
