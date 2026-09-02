import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await validateDuplicateUsername(userInputValues.username);
  await validateDuplicateEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);
  injectDefaultFeaturesInObject(userInputValues);

  const newUser = await runInsertUserQuery(userInputValues);
  return newUser;

  async function runInsertUserQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
            users (username, email, password, features) 
        VALUES 
            ($1, $2, $3, $4)
        RETURNING
            *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    });

    return results.rows[0];
  }

  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"];
  }
}

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

async function findOneByUsername(username) {
  const newUser = await runSelectUserQuery(username);
  return newUser;

  async function runSelectUserQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
            *
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

async function findOneByEmail(email) {
  const newUser = await runSelectUserQuery(email);
  return newUser;

  async function runSelectUserQuery(email) {
    const results = await database.query({
      text: `
        SELECT 
            *
        FROM
            users
        where
            LOWER(email) = Lower($1)
        LIMIT 
            1
        ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado no sistema.",
        action: "Verifique o email do usuario e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function findOneById(userId) {
  const newUser = await runSelectUserQuery(userId);
  return newUser;

  async function runSelectUserQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
            *
        FROM
            users
        where
            id = $1
        LIMIT 
            1
        ;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado no sistema.",
        action: "Verifique o id do usuario e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateDuplicateUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateDuplicateEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;

  async function runUpdateQuery(user) {
    const results = await database.query({
      text: `
        UPDATE 
          Users 
        SET 
            username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
        WHERE 
          id = $1
        RETURNING
            *
        ;`,
      values: [user.id, user.username, user.email, user.password],
    });

    return results.rows[0];
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });
    return results.rows[0];
  }
}

const user = {
  create,
  update,
  findOneByUsername,
  hashPasswordInObject,
  findOneByEmail,
  findOneById,
  setFeatures,
};

export default user;
