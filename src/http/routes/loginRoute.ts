import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { login } from "../../functions/login.ts";

export const loginRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/user",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6).max(15),
        }),
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      await login({ email, password, res });
    }
  );
};
