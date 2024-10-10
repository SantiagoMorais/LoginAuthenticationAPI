import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkToken } from "../../functions/checkToken.ts";
import { updateData } from "../../functions/updateData.ts";

export const updateDataRoute: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/auth/update",
    {
      schema: {
        body: z
          .object({
            newName: z.string().min(2).optional(),
            currentPassword: z.string().min(6).max(15),
            newPassword: z.string().min(6).max(15).optional(),
            confirmNewPassword: z.string().min(6).max(15).optional(),
            id: z.string(),
          })
          .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "Your new password and the confirmation don't combine.",
            path: ["confirmNewPassword"],
          }),
      },
    },
    async (req, res) => {
      checkToken(req, res);

      const {
        currentPassword,
        id,
        confirmNewPassword,
        newName,
        newPassword,
      } = req.body;

      await updateData({
        currentPassword,
        id,
        confirmNewPassword,
        newName,
        newPassword,
        res,
      });
    }
  );
};
