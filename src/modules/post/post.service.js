import prisma from "../../config/prisma.js";

// @mentions parser
const extractMentions = (content) => {
  const regex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

export const create = async (authorId, data) => {
  const { content } = data;

  const mentionUsernames = extractMentions(content);

  const post = await prisma.post.create({
    data: {
      content,
      authorId,
      mentionUsernames,
    },
  });

  // Handle mentions in DB
  if (mentionUsernames.length > 0) {
    const users = await prisma.user.findMany({
      where: { username: { in: mentionUsernames } },
    });

    const mentionRows = users.map((user) => ({
      postId: post.id,
      userId: user.id,
    }));

    if (mentionRows.length > 0) {
      await prisma.mention.createMany({
        data: mentionRows,
      });
    }
  }

  return post;
};

export const getPost = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      likes: true,
      comments: true,
      reposts: true,
    },
  });
};

export const deletePost = async (userId, postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId) throw new Error("Unauthorized to delete");

  await prisma.post.delete({ where: { id: postId } });
};

export const likePost = async (userId, postId) => {
  // Transaction (like + post likeCount++)
  return await prisma.$transaction(async (tx) => {
    await tx.like.create({
      data: { userId, postId },
    });

    await tx.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    return { liked: true };
  });
};

export const unlikePost = async (userId, postId) => {
  return await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({
      where: { userId, postId },
    });

    await tx.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });
  });
};

export const repost = async (userId, postId) => {
  return await prisma.$transaction(async (tx) => {
    await tx.repost.create({
      data: { userId, postId },
    });

    await tx.post.update({
      where: { id: postId },
      data: { repostCount: { increment: 1 } },
    });

    return { reposted: true };
  });
};

export const unrepost = async (userId, postId) => {
  return await prisma.$transaction(async (tx) => {
    await tx.repost.deleteMany({
      where: { userId, postId },
    });

    await tx.post.update({
      where: { id: postId },
      data: { repostCount: { decrement: 1 } },
    });
  });
};

export const getFeed = async (userId) => {
  // 1) Kullanıcının takip ettiklerini bul
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const ids = following.map((f) => f.followingId);

  ids.push(userId); // Kullanıcının kendi postları da dahil

  // 2) Takip edilenlerin postlarını yükle
  return await prisma.post.findMany({
    where: {
      authorId: { in: ids },
    },
    include: {
      author: true,
      likes: true,
      comments: true,
      reposts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
};
