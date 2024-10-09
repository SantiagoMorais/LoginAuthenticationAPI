import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getUserInfo } from "../../functions/getUserInfo.ts";
import { checkToken } from "../../functions/checkToken.ts";

export const getUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/user/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (req, res) => {
      const id = req.params.id;
      checkToken(req, res);

      await getUserInfo({ id, res });
    }
  );
};
