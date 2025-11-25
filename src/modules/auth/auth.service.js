import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (data) => {
  const { email, username, firstName, lastName, password } = data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error("Bu Email zaten kayıtlı");

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new Error("Bu kullanıcı adı zaten alınmış");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  console.log("cretaend", user);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { user, token };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Bu Email ile kayıtlı bir hesap bulunamadı.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Hatalı şifre");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  console.log(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token,
  };
};

export const checkUsername = async (username) => {
  if (!username || username.trim() === "") {
    throw new Error("Kullanıcı adı gerekli");
  }

  const find = await prisma.user.findUnique({
    where: { username },
  });

  const result = find === null ? true : false;

  return {
    available: result,
    username,
  };
};
