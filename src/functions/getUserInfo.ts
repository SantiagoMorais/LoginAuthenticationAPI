import { FastifyReply } from "fastify";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import mongoose from "mongoose";
import { User } from "../models/User.ts";

interface IGetUserInfo {
  id: string;
  res: FastifyReply;
}

export const getUserInfo = async ({ id, res }: IGetUserInfo) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send({ user });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Something went wrong, please try again later." });
  }
};
