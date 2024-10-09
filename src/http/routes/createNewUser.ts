import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { createNewUser } from "../../functions/createNewUser.ts";

export const createNewUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/register",
    {
      schema: {
        body: z
          .object({
            name: z.string().min(2),
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

      await createNewUser({ email, name, password, res });
    }
  );
};
