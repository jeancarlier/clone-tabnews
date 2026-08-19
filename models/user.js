import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await validateDuplicateEmail(userInputValues.email);
  await validateDuplicateUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertUserQuery(userInputValues);
  return newUser;

  async function validateDuplicateUsername(username) {
    const results = await database.query({
      text: `
        SELECT
            username
        FROM
            users
        WHERE
            LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "Username já esta sendo utilizado.",
        action: "Por favor, utilize outro username.",
      });
    }
  }

  async function validateDuplicateEmail(email) {
    const results = await database.query({
      text: `
        SELECT
            email
        FROM
            users
        WHERE
            LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "Email já esta sendo utilizado.",
        action: "Por favor, utilize outro email.",
      });
    }
  }

  async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  async function runInsertUserQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
            users (username, email, password) 
        VALUES 
            ($1, $2, $3)
        RETURNING
            *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const newUser = await runSelectUserQuery(username);
  return newUser;

  async function runSelectUserQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
            username, email, password, created_at, updated_at 
        FROM
            users
        where
            LOWER(username) = Lower($1)
        LIMIT 
            1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado no sistema.",
        action: "Verifique o nome do usuario e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
