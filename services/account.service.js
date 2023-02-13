import accountRepository from "../repositories/account.repository.js";

async function createAccount(account) {
  return await accountRepository.insertAccount(account);
}

async function getAccount() {
  return await accountRepository.getAccount();
}

async function getAccountById(id) {
  return await accountRepository.getAccountById(id);
}

async function deleteAccountById(id) {
  return await accountRepository.deleteAccountById(id);
}

async function updateAccount(accountData) {
  return await accountRepository.updateAccount(accountData);
}

async function updateBalance(accountData) {
  return await accountRepository.updateBalance(accountData);
}

export default {
  createAccount,
  getAccount,
  getAccountById,
  deleteAccountById,
  updateAccount,
  updateBalance,
};
