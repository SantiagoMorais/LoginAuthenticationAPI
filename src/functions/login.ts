import { FastifyReply } from "fastify";
import { User } from "../models/User.ts";
import bcrypt from "bcrypt";
import { env } from "../env.ts";
import jwt from "jsonwebtoken";

interface ILogin {
  email: string;
  password: string;
  res: FastifyReply;
}

export const login = async ({ email, password, res }: ILogin) => {
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .send({ message: "User not found, please check your email" });
  }

  if (!user.password || typeof user.password !== "string") {
    return res
      .status(500)
      .send({ message: "Password data is invalid or missing" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(401).send({ message: "Email or Password incorrect" });
  }

  try {
    const secret = env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res
      .status(200)
      .send({ message: "Autenticação realizada com sucesso", token, id: user.id });
  } catch (error) {
    res
      .status(500)
      .send();
  }

  res.send(user);
};
