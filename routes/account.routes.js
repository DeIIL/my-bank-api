import express from "express";
import accountController from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", accountController.createAccount);

router.get("/", accountController.getAccount);

router.get("/:id", accountController.getAccountById);

router.delete("/:id", accountController.deleteAccountById);

router.put("/", accountController.updateAccount);

router.patch("/updateBalance", accountController.updateBalance);

router.use((error, request, response, next) => {
  global.logger.error(
    `${request.method} ${request.baseUrl} - ${error.message}`
  );
  response.status(400).send({ error: error.message });
});

export default router;
