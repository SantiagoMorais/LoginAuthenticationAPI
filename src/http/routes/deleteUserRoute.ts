import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { deleteUser } from "../../functions/deleteUser.ts";
import { checkToken } from "../../functions/checkToken.ts";

export const deleteUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/auth/delete",
    {
      schema: {
        body: z.object({
          password: z.string(),
          id: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { id, password } = req.body;
      checkToken(req, res);

      await deleteUser({ id, password, res });
    }
  );
};
