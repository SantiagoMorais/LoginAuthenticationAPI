import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.ts";
import jwt from "jsonwebtoken";

export const checkToken = (req: FastifyRequest, res: FastifyReply) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Access denied!" });
  }

  try {
    const secret = env.SECRET;
    jwt.verify(token, secret);
  } catch (error) {
    res.status(400).send({ message: "Invalid token!" });
  }
};
