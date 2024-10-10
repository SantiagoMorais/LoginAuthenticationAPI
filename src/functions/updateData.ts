import { FastifyReply } from "fastify";
import { User } from "../models/User.ts";
import bcrypt from "bcrypt";

interface IUpdateData {
  newName: string | undefined | null;
  currentPassword: string;
  newPassword: string | undefined | null;
  confirmNewPassword: string | undefined | null;
  res: FastifyReply;
  id: string;
}

export const updateData = async ({
  confirmNewPassword,
  currentPassword,
  newName,
  newPassword,
  res,
  id,
}: IUpdateData) => {
  if (!currentPassword)
    return res.status(400).send({
      message: "To update your data, please fill your current password.",
    });

  const user = await User.findOne({
    _id: id,
  });

  if (!user)
    return res.status(401).send({
      message: "User not found, please try again.",
    });

  if (!user.password || typeof user.password !== "string") {
    return res
      .status(500)
      .send({ message: "Password data is invalid or missing" });
  }

  const checkPassword = await bcrypt.compare(currentPassword, user.password);

  if (!checkPassword)
    return res.status(401).send({
      message: "Your current password is not correct, please try again.",
    });

  if (!newName && !newPassword)
    return res
      .status(400)
      .send({ message: "Please, update at least one data." });

  const updates: { name?: string; password?: string } = {};

  try {
    if (newPassword) {
      if (!confirmNewPassword) {
        res.status(400).send({
          message: "To update your password, it's necessary to confirm it",
        });
      } else if (newPassword !== confirmNewPassword) {
        return res.status(400).send({
          message: "Your new password and the confirmation don't combine.",
        });
      } else if (newPassword === currentPassword) {
        return res.status(409).send({
          message:
            "Yor new password and your current one are the same. Please choose another one.",
        });
      } else {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        updates.password = passwordHash;
      }
    }

    if (newName) {
      if (newName === user.name) {
        return res.status(409).send({
          message:
            "Your new name is identical to your current name. Please choose a different one.",
        });
      } else {
        updates.name = newName;
      }
    }

    await User.updateOne({ _id: id }, { $set: updates });
    return res.status(201).send({
      message: `${newName ? "Name" : ""}${newName && newPassword ? " and " : ""}${newPassword ? "Password" : ""} updated successfully`,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Something went wrong, please try again later." });
  }
};
