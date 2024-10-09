import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { User } from "../models/User.ts";

interface ICreateNewUser {
  name: string;
  email: string;
  password: string;
  res: FastifyReply;
}

export const createNewUser = async ({
  email,
  name,
  password,
  res,
}: ICreateNewUser) => {
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
    return res.status(422).send({ message: "This email is already in use" });
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
};
