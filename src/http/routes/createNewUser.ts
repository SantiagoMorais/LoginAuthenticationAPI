import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { User } from "../../models/User.ts";
import bcrypt from "bcrypt";

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
            confirmPassowrd: z.string().min(6).max(15),
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
        return res.status(422).send({ message: "Name is required" });
      }

      if (!email) {
        return res.status(422).send({ message: "Email is required" });
      }

      if (!password) {
        return res.status(422).send({ message: "Password is required" });
      }

      const userExist = await User.findOne({ email });

      if (userExist) {
        return res
          .status(422)
          .send({ message: "This email is already in use" });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        email,
        password: passwordHash,
      });

      try {
        await user.save();
        res.status(201).send({
          message: "User successful created",
          user,
        });
      } catch (error) {
        res
          .status(500)
          .send({ msg: "Something went wrong, please try again later." });
      }
    }
  );
};
