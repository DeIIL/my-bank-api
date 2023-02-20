import express from "express";
import { graphqlHTTP } from "express-graphql";
import winston from "winston";

import { buildSchema } from "graphql";

import accountsRouter from "./routes/account.routes.js";
import accountService from "./services/account.service.js";

import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

global.fileName = "accounts.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${[label]} ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "my-bank-api.log" }),
  ],
  format: combine(label({ label: "my-bank-api" }), timestamp(), myFormat),
});

const schema = buildSchema(`
  type Account {
    id: Int
    name: String
    balance: Float
  }
  input AccountInput {
    id: Int
    name: String
    balance: Float
  }
  type Query {
    getAccount: [Account]
    getAccountById(id: Int): Account
  }
  type Mutation {
    createAccount(account: AccountInput): Account
    deleteAccount(id: Int): Boolean
    updateAccount(account: AccountInput): Account
  }
`);

const root = {
  getAccount: () => accountService.getAccount(),
  getAccountById(args) {
    return accountService.getAccountById(args.id);
  },
  createAccount({ account }) {
    return accountService.createAccount(account);
  },
  deleteAccount(args) {
    accountService.deleteAccountById(args.id);
  },
  updateAccount({ account }) {
    return accountService.updateAccount(account);
  },
};

const app = express();
app.use(express.json());

app.use("/account", accountsRouter);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(3333, async () => {
  try {
    await readFile(global.fileName);
    logger.info("API Started");
  } catch (error) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        logger.info("API Started and file Created");
      })
      .catch((error) => {
        logger.error(error);
      });
  }
});
