import { FastifyReply } from "fastify";
import { User } from "../models/User.ts";
import bcrypt from "bcrypt";

interface ILogin {
  email: string;
  password: string;
  res: FastifyReply;
}

export const login = async ({ email, password, res }: ILogin) => {
  // Checar se o usuário existe no banco de dados
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .send({ message: "User not found, please check your email" });
  }

  // Verificação de que a senha retornada não é null ou undefined
  if (!user.password || typeof user.password !== "string") {
    return res
      .status(500)
      .send({ message: "Password data is invalid or missing" });
  }

  // Verificar se a senha bate com a senha do usuário corresponte ao email inserido
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(401).send({ message: "Email or Password incorrect" });
  }

  // Aqui realizamos a autenticação do usuário no sistema

  res.send(user);
};
