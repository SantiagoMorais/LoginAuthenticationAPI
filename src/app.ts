import fastify from "fastify";
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = fastify();
const port = 3000;

app.get("/", (req, res) => {
  res
    .status(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ msg: "Rota inicial" });
});

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
  }
  console.log(`Server running on http://localhost:${port}`);
});
