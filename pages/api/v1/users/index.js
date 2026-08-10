import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import users from "models/user.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const usersInputValues = request.body;
  const newUser = await users.create(usersInputValues);
  return response.status(201).json(newUser);
}
