import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/user/delete",
    {
      schema: {
        body: z.object({
          password: z.string(),
          id: z.string(),
        }),
      },
    },
    (req, res) => {
      const { id, password } = req.body;
    }
  );
};
