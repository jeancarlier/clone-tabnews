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
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  console.log("PATCH /api/v1/users/[username] called with body:", request.body);
  const username = request.query.username;
  const userInputValues = request.body;

  const userTryingToPatch = request.context.user;
  const targetUser = await users.findOneByUsername(username);

  console.log("User trying to patch:", userTryingToPatch);
  console.log("Target user:", targetUser);
  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    console.log("User trying to patch does not have permission.");
    throw new ForbiddenError({
      message: "Você não tem permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }
  console.log("User trying to patch has permission. Proceeding with update.");

  if (!targetUser) {
    return response.status(404).json({ error: "User not found" });
  }

  const updatedUser = await users.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
