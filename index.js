import express from "express";
import { graphqlHTTP } from "express-graphql";
import basicAuth from "express-basic-auth";
import winston from "winston";

import { buildSchema } from "graphql";

import accountsRouter from "./routes/account.routes.js";
import accountService from "./services/account.service.js";

import cors from "cors";
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
app.use(cors());
app.use(express.static("public"));

function getRole(username) {
  if (username == "admin") {
    return "admin";
  }
}

function authorization(...allowed) {
  const isAllowed = (role) => allowed.indexOf(role) > -1;

  return (request, response, next) => {
    if (request.auth.user) {
      const role = getRole(request.auth.user);
      if (isAllowed(role)) {
        next();
      } else {
        response.status(401).send("Role not allowed");
      }
    } else {
      response.status(403).send("User not found");
    }
  };
}

app.use(
  basicAuth({
    authorizer: (username, password) => {
      const userMatches = basicAuth.safeCompare(username, "admin");
      const pwdMatches = basicAuth.safeCompare(password, "admin");

      return userMatches && pwdMatches;
    },
  })
);

app.use("/account", authorization("admin"), accountsRouter);

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
