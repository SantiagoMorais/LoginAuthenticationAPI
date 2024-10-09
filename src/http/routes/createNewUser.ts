import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const createNewUser: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/register",
    {
      schema: {
        body: z
          .object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6).max(15),
            confirmPassowrd: z.string().min(6).max(15)
          })
          .refine((data) => data.password === data.confirmPassowrd, {
            message: "Passwords must be the same",
            path: ["confirmPassword"],
          }),
      },
    },
    async (req, res) => {
      const { name, email, password, confirmPassowrd } = req.body;

      if (!name) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ message: "Name is required" });
      }

      if (!email) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ message: "Email is required" });
      }

      if (!password) {
        return res
          .status(422)
          .header("content-type", "application-json; charset=utf-8")
          .send({ message: "Password is required" });
      }

      res
        .status(201)
        .header("content-type", "application-json; charset=utf-8")
        .send({
          message: "User successful created",
          name,
          email,
          password,
          confirmPassowrd,
        });
    }
  );
};
