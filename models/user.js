import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validateDuplicateEmail(userInputValues.email);
  await validateDuplicateUsername(userInputValues.username);

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

const user = {
  create,
};

export default user;
