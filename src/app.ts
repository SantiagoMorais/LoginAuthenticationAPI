import fastify from "fastify";
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "./env.ts";

const app = fastify();
const port = 3000;

app.get("/", (_, res) => {
  res
    .status(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ msg: "Rota inicial" });
});

const dbUser = env.DB_USER;
const dbPassword = env.DB_PASSWORD;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rbacb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen({ port }, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Connected in Mongo Database`);
    });
  })
  .catch((err) => console.log(err));
