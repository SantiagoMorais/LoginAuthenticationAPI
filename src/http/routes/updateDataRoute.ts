import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateDataRoute: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/auth/update",
    {
      schema: {
        body: z
          .object({
            newName: z.string(),
            currentPassword: z.string().min(6).max(15),
            newPassword: z.string().min(6).max(15),
            confirmNewPassword: z.string().min(6).max(15),
          })
          .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "Your new password confirmation don't combine.",
            path: ["confirmNewPassword"]
          }),
      },
    },
    async (req, res) => {
        
    }
  );
};
