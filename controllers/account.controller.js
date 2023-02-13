import accountService from "../services/account.service.js";

async function createAccount(request, response, next) {
  try {
    let account = request.body;

    if (!account.name || account.balance == null) {
      throw new Error("Name and Balance undefined");
    }
    account = await accountService.createAccount(account);
    response.send(account);
    global.logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (error) {
    next(error);
  }
}

async function getAccount(request, response, next) {
  try {
    response.send(await accountService.getAccount());
    global.logger.info(`GET /account`);
  } catch (error) {
    next(error);
  }
}

async function getAccountById(request, response, next) {
  try {
    response.send(await accountService.getAccountById(request.params.id));
    global.logger.info(`GET /account/:id`);
  } catch (error) {
    next(error);
  }
}

async function deleteAccountById(request, response, next) {
  try {
    response.end(await accountService.deleteAccountById(request.params.id));
    global.logger.info(`DELETE /account/:id - ${request.params.id}`);
  } catch (error) {
    next(error);
  }
}

async function updateAccount(request, response, next) {
  try {
    const accountData = request.body;
    if (!accountData.id || !accountData.name || accountData.balance == null) {
      throw new Error("ID, Name and Balance undefined");
    }
    response.send(await accountService.updateAccount(accountData));
    global.logger.info(`PUT /account - ${JSON.stringify(accountData)}`);
  } catch (error) {
    next(error);
  }
}

async function updateBalance(request, response, next) {
  try {
    const accountData = request.body;
    if (!accountData.id || accountData.balance == null) {
      throw new Error("ID and Balance undefined");
    }
    response.send(await accountService.updateBalance(accountData));
    global.logger.info(
      `PATCH /account/updateBalance - ${JSON.stringify(accountData)}`
    );
  } catch (error) {
    next(error);
  }
}

export default {
  createAccount,
  getAccount,
  getAccountById,
  deleteAccountById,
  updateAccount,
  updateBalance,
};
