import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import users from "models/user.js";
import authorization from "models/authorization.js";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await users.findOneByUsername(username);
  const userTryingToGet = request.context.user;

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFound,
  );

  return response.status(200).json(secureOutputValues);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const userTryingToPatch = request.context.user;
  const targetUser = await users.findOneByUsername(username);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    console.log("User trying to patch does not have permission.");
    throw new ForbiddenError({
      message: "Você não tem permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }

  if (!targetUser) {
    return response.status(404).json({ error: "User not found" });
  }

  const updatedUser = await users.update(username, userInputValues);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:user",
    updatedUser,
  );

  return response.status(200).json(secureOutputValues);
}
