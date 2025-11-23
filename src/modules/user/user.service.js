import prisma from "../../config/prisma.js";

export const getMe = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bio: true,
      followers: true,
      following: true,
    },
  });
};

export const getProfile = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
    include: {
      bio: true,
      followers: true,
      following: true,
      posts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const updateProfile = async (userId, data) => {
  const allowed = ["firstName", "lastName", "avatarUrl"];
  const updateData = {};

  allowed.forEach((field) => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

export const updateBio = async (userId, data) => {
  return await prisma.userBio.upsert({
    where: { userId },
    update: {
      bio: data.bio,
      location: data.location,
      website: data.website,
      birthday: data.birthday ? new Date(data.birthday) : null,
    },
    create: {
      userId,
      bio: data.bio,
      location: data.location,
      website: data.website,
      birthday: data.birthday ? new Date(data.birthday) : null,
    },
  });
};

export const follow = async (followerId, username) => {
  const targetUser = await prisma.user.findUnique({ where: { username } });
  if (!targetUser) throw new Error("User not found");

  if (targetUser.id === followerId)
    throw new Error("You cannot follow yourself");

  // check existing follow
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: targetUser.id },
    },
  });

  if (existing) throw new Error("Already following");

  return await prisma.follow.create({
    data: {
      followerId,
      followingId: targetUser.id,
    },
  });
};

export const unfollow = async (followerId, username) => {
  const targetUser = await prisma.user.findUnique({ where: { username } });
  if (!targetUser) throw new Error("User not found");

  return await prisma.follow.deleteMany({
    where: {
      followerId,
      followingId: targetUser.id,
    },
  });
};

// Kullanıcı adı uygunluğunu kontrol etme
export const checkUsername = async (username) => {
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  return {
    username,
    available: existing ? false : true,
  };
};
