import { FastifyReply } from "fastify";
import { User } from "../models/User.ts";
import bcrypt from "bcrypt";

interface IDeleteUser {
  id: string;
  password: string;
  res: FastifyReply;
}

export const deleteUser = async ({ id, password, res }: IDeleteUser) => {
  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.status(404).send({ msg: "User not found" });
  }

  if (!password) {
    return res
      .status(400)
      .send({ msg: "To delete your account, please confirm your password" });
  }

  if (!user.password || typeof user.password !== "string") {
    return res
      .status(500)
      .send({ message: "Password data is invalid or missing" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).send({ message: "Incorrect password. Try again." });
  }

  try {
    await user.deleteOne();
    return res
      .status(200)
      .send({ message: "User account deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Something went wrong, please try again later." });
  }
};
