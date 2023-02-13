import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

async function insertAccount(account) {
  const data = JSON.parse(await readFile(global.fileName));
  account = { id: data.nextId, name: account.name, balance: account.balance };
  data.nextId++;
  data.accounts.push(account);

  await writeFile(global.fileName, JSON.stringify(data, null, 2));
  return account;
}

async function getAccount() {
  const data = JSON.parse(await readFile(global.fileName));
  return data.accounts;
}

async function getAccountById(id) {
  const data = JSON.parse(await readFile(global.fileName));
  const account = data.accounts.find((account) => account.id === parseInt(id));
  if (account) {
    return account;
  } else {
    throw new Error("Registry not found");
  }
}

async function deleteAccountById(id) {
  const data = JSON.parse(await readFile(global.fileName));
  data.accounts = data.accounts.filter(
    (account) => account.id !== parseInt(id)
  );
  await writeFile(global.fileName, JSON.stringify(data, null, 2));
}

async function updateAccount(accountData) {
  const data = JSON.parse(await readFile(global.fileName));
  const index = data.accounts.findIndex(
    (account) => account.id === accountData.id
  );
  if (index === -1) {
    throw new Error("Registry not found");
  }
  data.accounts[index].name = accountData.name;
  data.accounts[index].balance = accountData.balance;
  await writeFile(global.fileName, JSON.stringify(data, null, 2));
  return data.accounts[index];
}

async function updateBalance(accountData) {
  const data = JSON.parse(await readFile(global.fileName));
  const index = data.accounts.findIndex(
    (account) => account.id === accountData.id
  );
  if (index === -1) {
    throw new Error("Registry not found");
  }
  data.accounts[index].balance = accountData.balance;
  await writeFile(global.fileName, JSON.stringify(data, null, 2));
  return data.accounts[index];
}

export default {
  insertAccount,
  getAccount,
  getAccountById,
  deleteAccountById,
  updateAccount,
  updateBalance,
};
