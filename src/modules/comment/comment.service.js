import prisma from "../../config/prisma.js";

export const create = async (userId, data) => {
  const { postId, content } = data;

  if (!content || content.trim() === "")
    throw new Error("Content cannot be empty");

  // Transaction: comment + post.commentCount++
  return await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        userId,
        postId,
        content,
      },
      include: {
        user: true,
      },
    });

    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  });
};

export const getComment = async (id) => {
  return await prisma.comment.findUnique({
    where: { id },
    include: {
      user: true,
      post: true,
    },
  });
};

export const deleteComment = async (userId, commentId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== userId) throw new Error("Unauthorized to delete");

  return await prisma.$transaction(async (tx) => {
    await tx.comment.delete({
      where: { id: commentId },
    });

    await tx.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
  });
};

export const getCommentsForPost = async (postId) => {
  return await prisma.comment.findMany({
    where: { postId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};
