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
import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();
const port = 3000;

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

// open route - public route
const publicRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/", (_, res) => {
    res
      .status(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ msg: "Initial route" });
  });
};

// register a new user
const createNewUser: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/register",
    {
      schema: {
        body: z
          .object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(6).max(15),
            confirmPassowrd: z.string().min(6).max(15),
          })
          .refine((data) => data.password === data.confirmPassowrd, {
            message: "Passwords must be the same",
            path: ["confirmPassword"],
          }),
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body;

      if (!name) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ msg: "Name is required" });
      }
      if (!email) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ msg: "Email is required" });
      }
      if (!password) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ msg: "Password is required" });
      }

      res
        .status(201)
        .header("content-type", "application-json; charset=utf-8")
        .send({ msg: "User successful created" });
    }
  );
};

app.register(publicRoute);
app.register(createNewUser);

// credentials
const dbUser = env.DB_USER;
const dbPassword = env.DB_PASSWORD;

// connect to the db
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
