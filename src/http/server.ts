import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../env.ts";
import fastifyCors from "@fastify/cors";
import { publicRoute } from "./routes/publicRoute.ts";
import { createNewUser } from "./routes/createNewUser.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();
const port = 3000;
const dbUser = env.DB_USER;
const dbPassword = env.DB_PASSWORD;

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

app.register(publicRoute);
app.register(createNewUser);

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rbacb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen({ port }).then(() => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Connected to the Mongo Database`);
    });
  })
  .catch((err) => console.log(err));
