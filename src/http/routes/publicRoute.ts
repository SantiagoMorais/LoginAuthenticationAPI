import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const publicRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/", (_, res) => {
    res
      .status(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ message: "Initial route" });
  });
};
